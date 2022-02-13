import InstanceSkel = require('../../../instance_skel')
import { CompanionConfigField, CompanionSystem } from '../../../instance_skel_types'
import { GetActionsList } from './Companion/actions'
import { DeviceConfig, GetConfigFields } from './Companion/config'
import { GetFeedbacksList } from './Companion/feedback'
import { IConnection } from './NdiController/interfaces'
import { initializeNdiControllerWatcher } from './NdiController/ndiControllerClient'

class ControllerInstance extends InstanceSkel<DeviceConfig> {
	connection: IConnection = {status: null }

	constructor(system: CompanionSystem, id: string, config: DeviceConfig) {
		super(system, id, config)
		this.connection.status = this.STATUS_UNKNOWN
	}

	/**
	 * Main initialization function called once the module
	 * is OK to start doing things.
	 */
	public init(): void {
		this.status(this.STATUS_UNKNOWN)
		this.updateConfig(this.config)

		this.setFeedbackDefinitions(GetFeedbacksList(this))
		this.setActions(GetActionsList())

		this.checkFeedbacks()
	}

	/**
	 * Process an updated configuration array.
	 */
	public updateConfig(config: DeviceConfig): void {
		this.config = config
		if (this.connection.timerInstance) {
			clearInterval(this.connection.timerInstance)
		}
		this.tryConnect()
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
		} catch (e) {
			// Ignore
		}
		if (this.connection.timerInstance) {
			clearInterval(this.connection.timerInstance)
		}
		this.debug('destroy', this.id)
		this.connection.status = this.STATUS_UNKNOWN
		this.status(this.connection.status)
	}

	private async tryConnect(): Promise<void> {
		if (this.connection.status === this.STATUS_OK) {
			return
		}
		this.connection = await initializeNdiControllerWatcher(this)
		this.status(this.connection.status)
	}
}

export = ControllerInstance
