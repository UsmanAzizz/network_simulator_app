// Util untuk konversi IP string ke representasi Integer
function ipToInt(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

// Mengecek apakah 2 IP berada di subnet yang sama. (Default menggunakan /24)
export function isSameSubnet(ip1, ip2, cidr = 24) {
  if (!ip1 || !ip2) return false;
  
  const cleanIp1 = ip1.split('/')[0].trim();
  const cleanIp2 = ip2.split('/')[0].trim();
  
  const cidr1 = ip1.includes('/') ? parseInt(ip1.split('/')[1], 10) : cidr;
  const cidr2 = ip2.includes('/') ? parseInt(ip2.split('/')[1], 10) : cidr;

  if (cidr1 !== cidr2) return false; 

  try {
    const mask = ~((1 << (32 - cidr1)) - 1) >>> 0;
    const net1 = (ipToInt(cleanIp1) & mask) >>> 0;
    const net2 = (ipToInt(cleanIp2) & mask) >>> 0;
    
    return net1 === net2;
  } catch (e) {
    return false;
  }
}

// Dapatkan semua IP dari node
function getNodeIps(node) {
  if (node.type === 'pc' || node.type === 'server') {
    const ip = node.data.ip || (node.type === 'server' ? '8.8.8.8' : null);
    return ip ? [ip] : [];
  }
  if (node.type === 'router') {
    const ips = [];
    if (node.data.eth0Ip) ips.push(node.data.eth0Ip);
    if (node.data.eth1Ip) ips.push(node.data.eth1Ip);
    return ips;
  }
  return [];
}

// Mendapatkan segment L2 dari sebuah node start (BFS melalui switch & modem)
function getL2Segment(startNodeId, nodes, graph) {
  const visited = new Set();
  const queue = [startNodeId];
  const segmentNodes = [];

  while (queue.length > 0) {
    const currId = queue.shift();
    if (!visited.has(currId)) {
      visited.add(currId);
      
      const currNode = nodes.find(n => n.id === currId);
      if (currNode) {
        segmentNodes.push(currNode);
        
        if (currId === startNodeId || currNode.type === 'switch' || currNode.type === 'modem') {
          graph[currId].forEach(neighbor => {
            if (!visited.has(neighbor)) {
              queue.push(neighbor);
            }
          });
        }
      }
    }
  }
  return segmentNodes;
}

// Helper untuk Cek Aturan Sambungan Fisik Sederhana (Untuk Pemula)
function checkConnectionRules(nodeA, nodeB) {
  const typeA = nodeA.type;
  const typeB = nodeB.type;
  
  const types = [typeA, typeB];
  
  if (types.includes('pc') && types.includes('pc')) {
    return { valid: false, message: 'PC tidak boleh dihubungkan langsung ke sesama PC.' };
  }
  if (types.includes('pc') && types.includes('server')) {
    return { valid: false, message: 'PC tidak boleh dihubungkan langsung ke Server.' };
  }
  if (types.includes('pc') && types.includes('modem')) {
    return { valid: false, message: 'PC tidak bisa terhubung langsung ke Modem. Harus lewat Router.' };
  }
  if (types.includes('server') && !types.includes('modem')) {
    return { valid: false, message: 'Server harus dihubungkan melalui Modem agar bisa diakses secara publik.' };
  }

  return { valid: true };
}

export function validateNetworkTopology(nodes, edges) {
  const nodeResults = {}; 
  const statusTexts = {}; 
  const issues = []; 
  
  // Build Adjacency List (Graph) & Map Edge
  const graph = {};
  const edgeMap = {}; // "source-target" -> edge
  nodes.forEach(n => graph[n.id] = []);
  edges.forEach(edge => {
    if (graph[edge.source] && graph[edge.target]) {
      graph[edge.source].push(edge.target);
      graph[edge.target].push(edge.source);
      edgeMap[`${edge.source}-${edge.target}`] = edge;
      edgeMap[`${edge.target}-${edge.source}`] = edge;
    }
  });

  // Layer 1 Check (Hierarki Sederhana)
  const layer1Fails = new Set();
  
  nodes.forEach(node => {
    nodeResults[node.id] = '💤';
    statusTexts[node.id] = 'Kabel terputus / Idle.';
    
    const neighbors = graph[node.id];
    if (neighbors.length > 0) {
      nodeResults[node.id] = '✅';
      statusTexts[node.id] = 'Aktif dan Terhubung secara fisik.';
      
      neighbors.forEach(neighborId => {
        const neighbor = nodes.find(n => n.id === neighborId);
        if (neighbor) {
          const ruleCheck = checkConnectionRules(node, neighbor);
          if (!ruleCheck.valid) {
            nodeResults[node.id] = '❌';
            statusTexts[node.id] = `Kesalahan Fisik: ${ruleCheck.message}`;
            issues.push(statusTexts[node.id]);
            layer1Fails.add(node.id);
            layer1Fails.add(neighborId);
          }
        }
      });
    }
  });

  const pcs = nodes.filter(n => n.type === 'pc');
  const servers = nodes.filter(n => n.type === 'server');
  
  // Lakukan pengecekan IP dan Layer 3 HANYA jika lolos Layer 1
  pcs.forEach(pc => {
    if (layer1Fails.has(pc.id)) return; // Jangan cek IP jika kabel aja salah
    if (graph[pc.id].length === 0) return; // Terputus

    const localL2Nodes = getL2Segment(pc.id, nodes, graph);
    // Hapus node yang layer 1 fail dari segmen L2 ini
    const validL2Nodes = localL2Nodes.filter(n => !layer1Fails.has(n.id));
    
    const localRouters = validL2Nodes.filter(n => n.type === 'router');
    const localServers = validL2Nodes.filter(n => n.type === 'server');
    const localModems = validL2Nodes.filter(n => n.type === 'modem');

    let activeIp = pc.data.ip;
    let activeGateway = pc.data.gateway;

    // Deteksi Tabrakan DHCP
    if (localRouters.length > 1) {
      nodeResults[pc.id] = '⚠️';
      statusTexts[pc.id] = 'DHCP Conflict: Terdapat lebih dari 1 Router (DHCP Server) di segmen jaringan ini.';
      issues.push(`Konflik DHCP terdeteksi di segmen PC ${pc.data.label}.`);
      return;
    }

    if (pc.data.dhcp) {
      if (localRouters.length === 1) {
        const router = localRouters[0];
        const rIp = router.data.eth1Ip || router.data.eth0Ip || '192.168.1.1';
        activeGateway = rIp;
        const parts = rIp.split('.');
        parts[3] = (100 + parseInt(pc.id.split('-')[1]) % 100).toString(); 
        activeIp = parts.join('.');
        statusTexts[pc.id] = `DHCP Berhasil. IP: ${activeIp}, GW: ${activeGateway}`;
      } else {
        // Terisolasi dari router
        nodeResults[pc.id] = '❌';
        if (localServers.length > 0) {
          statusTexts[pc.id] = 'Jaringan Terisolasi: Terhubung ke Server, tapi PC gagal mendapat IP karena tidak ada Router (DHCP Server).';
        } else if (localModems.length > 0) {
          statusTexts[pc.id] = 'DHCP Gagal: Modem hanya melewatkan sinyal publik (Layer 1/2), Anda butuh Router (Layer 3) untuk DHCP.';
        } else {
          statusTexts[pc.id] = 'DHCP Timeout: Tidak ada Router/DHCP Server yang terhubung ke jaringan ini.';
        }
        issues.push(`PC ${pc.data.label} gagal DHCP karena ketiadaan Router.`);
        return;
      }
    } else {
      statusTexts[pc.id] = `Mode Statis. IP: ${activeIp}, GW: ${activeGateway}`;
    }

    if (!activeIp) {
      nodeResults[pc.id] = '❌';
      statusTexts[pc.id] = 'IP Address PC belum diatur (Kosong).';
      return;
    }

    // Ping test ke Local
    const reachableEndpoints = validL2Nodes.filter(n => (n.type === 'pc' || n.type === 'server') && n.id !== pc.id);
    let isSuccess = false;
    let isSubnetFail = false;
    let isGatewayFail = false;

    reachableEndpoints.forEach(targetNode => {
      const targetIps = getNodeIps(targetNode);
      if (targetIps.length > 0) {
        if (isSameSubnet(activeIp, targetIps[0])) {
          isSuccess = true;
          statusTexts[pc.id] += ` | Terkoneksi ke ${targetNode.data.label}`;
        } else {
          isSubnetFail = true;
        }
      }
    });

    // Ping test via Router (Beda Subnet / Internet)
    if (localRouters.length === 1) {
      const router = localRouters[0];
      const routerIps = getNodeIps(router);
      
      let validGateway = false;
      routerIps.forEach(rIp => {
        if (activeGateway === rIp && isSameSubnet(activeIp, rIp)) validGateway = true;
      });

      if (!validGateway) {
        isGatewayFail = true;
        issues.push(`Default Gateway PC ${pc.data.label} tidak bisa dijangkau oleh IP-nya sendiri.`);
      } else {
        // Router meneruskan ke WAN/Lainnya
        const routerL2Segment = getL2Segment(router.id, nodes, graph);
        const remoteEndpoints = routerL2Segment.filter(n => (n.type === 'pc' || n.type === 'server') && n.id !== pc.id);
        
        remoteEndpoints.forEach(remoteNode => {
          const remoteIps = getNodeIps(remoteNode);
          if (remoteIps.length > 0) {
            let routerCanReach = routerIps.some(rIp => isSameSubnet(rIp, remoteIps[0]));
            if (routerCanReach) {
              isSuccess = true;
              statusTexts[pc.id] += ` | Tembus ke ${remoteNode.data.label} via Gateway`;
            }
          }
        });
      }
    }

    if (isSuccess) {
      nodeResults[pc.id] = '✅';
    } else if (isGatewayFail) {
      nodeResults[pc.id] = '❌';
      statusTexts[pc.id] += ' | Unreachable Gateway: Gateway tidak valid / beda subnet.';
    } else if (isSubnetFail) {
      nodeResults[pc.id] = '❌';
      statusTexts[pc.id] += ' | Destination Host Unreachable (Beda Subnet tanpa Router).';
    } else if (reachableEndpoints.length === 0 && localRouters.length === 0) {
      nodeResults[pc.id] = '❓';
      statusTexts[pc.id] += ' | Terisolasi: Sendirian di jaringan.';
    }
  });

  // Evaluasi Server
  servers.forEach(server => {
    if (layer1Fails.has(server.id)) return;
    if (graph[server.id].length > 0) {
      const serverL2 = getL2Segment(server.id, nodes, graph);
      if (serverL2.length > 1) {
        nodeResults[server.id] = '✅';
        statusTexts[server.id] = 'Server aktif dan mengudara (Online).';
      } else {
        nodeResults[server.id] = '❓';
        statusTexts[server.id] = 'Server terisolasi. Tidak melayani siapa-siapa.';
      }
    }
  });

  return { results: nodeResults, issues: [...new Set(issues)], statusTexts };
}
