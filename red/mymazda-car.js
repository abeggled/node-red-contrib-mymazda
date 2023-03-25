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
            GetVehicleStatus(msg)
            break
          case 'getEVVehicleStatus':
            // Retrieve realtime EV status of vehicle
            GetEVVehicleStatus(msg)
            break
          case 'getHVACSetting':
            // Retrieve realtime HVAC settings of vehicle
            GetHVACSetting(msg)
            break
          case 'startEngine':
            await client.startEngine(vehicleId)
            break
          case 'stopEngine':
            await client.stopEngine(vehicleId)
            break
          case 'startCharging':
            await client.startCharging(vehicleId)
            break
          case 'stopCharging':
            await client.stopCharging(vehicleId)
            break
          case 'lockDoors':
            await client.lockDoors(vehicleId)
            break
          case 'unlockDoors':
            await client.unlockDoors(vehicleId)
            break
          case 'turnHazardLightsOn':
            await client.turnHazardLightsOn(vehicleId)
            break
          case 'turnHazardLightsOff':
            await client.turnHazardLightsOff(vehicleId)
            break
          case 'turnOnHVAC':
            await client.turnOnHVAC(vehicleId)
            break
          case 'turnOffHVAC':
            await client.turnOffHVAC(vehicleId)
            break
          case 'refreshVehicleStatus':
            await client.refreshVehicleStatus(vehicleId)
            break
          case 'sendPOI':
            node.error(`Command not yet implemented: ${cmd}`)
            break
          case 'setHVACSetting':
            node.error(`Command not yet implemented: ${cmd}`)
            break
          default:
            node.error(`Command not supported: ${cmd}`)
        }
      } catch (err) {
        done(err.message)
      }
    })

    async function GetVehicleStatus(passMsg = {}) {
      try {
        let status = await client.getVehicleStatus(vehicleId)
        node.send({ ...passMsg, topic: 'status', payload: status })
      } catch (err) {
        node.error(err)
      }
    }

    async function GetEVVehicleStatus(passMsg = {}) {
      try {
        let status = await client.getEVVehicleStatus(vehicleId)
        node.send({ ...passMsg, topic: 'status', payload: status })
      } catch (err) {
        node.error(err)
      }
    }

    async function GetHVACSetting(passMsg = {}) {
      try {
        let status = await client.getHVACSetting(vehicleId)
        node.send({ ...passMsg, topic: 'status', payload: status })
      } catch (err) {
        node.error(err)
      }
    }

 //   node.on('close', removed => {
 //     if (removed) clearInterval(node.pollTimer)
 //   })
  }

  RED.nodes.registerType('mymazda-car', MyMazdaCar)
}