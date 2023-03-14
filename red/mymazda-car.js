module.exports = function (RED) {
  function MyMazdaCar(config) {
    // Get account configuration and ref the underlying client
    let accountNode = RED.nodes.getNode(config.account)
    if (!accountNode) return
    const client = accountNode.client

    // Save vehicle ID
    const vehicleId = config.vehicle

    // Create a RED node
    RED.nodes.createNode(this, config)
    const node = this

    // Data/request from node, pass to client
    node.on('input', async (msg, send, done) => {
      let cmd = msg.payload
      let opts = msg.options || {}

      try {
        switch (cmd) {
          case 'getInfo':
            // Retrieve information about the vehicle
            if (opts.refetch) await accountNode.listVehicles()
            let info = accountNode.vehicles.find(veh => veh.id == vehicleId)
            send({ ...msg, topic: 'info', payload: info })
            break

          case 'getVehicleStatus':
            // Retrieve realtime status of vehicle
            getStatus(msg)
            break
          case 'getEVVehicleStatus':
              // Retrieve realtime status of vehicle
              getEVStatus(msg)
              break
          case 'getHVACSetting':
            // Retrieve realtime status of vehicle
            getHVACSetting(msg)
            break
          case 'startEngine':
          case 'stopEngine':
          case 'lockDoors':
          case 'unlockDoors':
          case 'turnHazardLightsOn':
          case 'turnHazardLightsOff':
          case 'turnOnHVAC':
          case 'turnOffHVAC':
          case 'refreshVehicleStatus':
              await client[cmd](vehicleId)
              // Nothing to ouput
              break
          default:
            node.warn(`Command not supported: ${cmd}`)
        }
      } catch (err) {
        done(err.message)
      }
    })

    async function getStatus(passMsg = {}) {
      try {
        let status = await client.getVehicleStatus(vehicleId)
        node.send({ ...passMsg, topic: 'status', payload: status })
      } catch (err) {
        node.error(err)
      }
    }

    async function getEVStatus(passMsg = {}) {
      try {
        let status = await client.getEVVehicleStatus(vehicleId)
        node.send({ ...passMsg, topic: 'status', payload: status })
      } catch (err) {
        node.error(err)
      }
    }

    async function getHVACSetting(passMsg = {}) {
      try {
        let status = await client.getHVACSetting(vehicleId)
        node.send({ ...passMsg, topic: 'status', payload: status })
      } catch (err) {
        node.error(err)
      }
    }

    node.on('close', removed => {
      if (removed) clearInterval(node.pollTimer)
    })
  }

  RED.nodes.registerType('mymazda-car', MyMazdaCar)
}