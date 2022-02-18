import InstanceSkel = require('../../../instance_skel')
import { CompanionConfigField, CompanionSystem } from '../../../instance_skel_types'
import { GetActionsList } from './Companion/actions'
import { DeviceConfig, GetConfigFields } from './Companion/config'
import { GetFeedbacksList } from './Companion/feedback'
import { NdiControllerConnection } from './NdiController/ndiControllerClient'

class ControllerInstance extends InstanceSkel<DeviceConfig> {
	ndiConnection: NdiControllerConnection

	constructor(system: CompanionSystem, id: string, config: DeviceConfig) {
		super(system, id, config)
		this.ndiConnection = new NdiControllerConnection(this)
	}

	/**
	 * Main initialization function called once the module
	 * is OK to start doing things.
	 */
	public init(): void {
		this.status(this.STATUS_UNKNOWN)
		this.updateConfig(this.config)

		this.setFeedbackDefinitions(GetFeedbacksList(this, this.ndiConnection))
		this.setActions(GetActionsList(this.ndiConnection))

		this.checkFeedbacks()
	}

	/**
	 * Process an updated configuration array.
	 */
	public updateConfig(config: DeviceConfig): void {
		this.config = config
		this.ndiConnection.destroy()
		this.tryConnect().catch(() => {
			this.log('error', 'Error connecting to NDI Controller')
		})
	}

	/**
	 * Creates the configuration fields for web config.
	 */
	public config_fields(): CompanionConfigField[] {
		return GetConfigFields()
	}

	/**
	 * Clean up the instance before it is destroyed.
	 */
	public destroy(): void {
		try {
			console.log('Closing down')
			this.ndiConnection.destroy()
			this.debug('destroy', this.id)
			this.status(this.STATUS_UNKNOWN)
		} catch (e) {
			this.log('error', 'Error cleaning up olzzon-ndicontroller module')
			this.status(this.STATUS_ERROR)
		}
	}

	private async tryConnect(): Promise<void> {
		this.ndiConnection.initialize()
	}
}

export = ControllerInstance
