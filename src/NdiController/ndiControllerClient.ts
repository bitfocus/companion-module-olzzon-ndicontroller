import { DeviceConfig } from '../Companion/config'
import InstanceSkel = require('../../../../instance_skel')
import axios from 'axios'
import { IConnection, INdiState, ISource, ITarget } from './interfaces'
import { FeedbackId } from '../Companion/feedback'
import { CompanionVariable } from '../../../../instance_skel_types'

export class NdiControllerConnection {
	instance: InstanceSkel<DeviceConfig>
	POLL_SPEED = 300
	NDIurl: string
	NDIport: number
	NDIState: INdiState
	pollTimer: NodeJS.Timeout | undefined
	connectionStatus: IConnection = { status: null }

	constructor(instance: InstanceSkel<DeviceConfig>) {
		this.NDIurl = instance.config.url || 'localhost'
		this.NDIport = instance.config.port || 5901
		this.NDIState = { targets: [], sources: [] }
		this.instance = instance
		this.connectionStatus.status = null
	}

	public initialize = () => {
		this.instance.log(
			'info',
			`Initializing datafetching from NDI Controller at : http://${this.NDIurl}:${this.NDIport}/state`
		)
		axios
			.get(`http://${this.NDIurl}:${this.NDIport}/state`)
			.then((response): void => {
				const variables: CompanionVariable[] = []
				this.NDIState = response.data as INdiState
				for (let index = 0; index < this.NDIState.sources.length; index++) {
					variables.push({ name: `source${index + 1}`, label: 'NDI Controller Source Label' })
				}
				this.instance.setVariableDefinitions(variables)
				this.instance.checkFeedbacks()

				this.pollTimer = this.timerPollNdiController()
				this.connectionStatus.status = this.instance.STATUS_OK
			})
			.catch(() => {
				this.instance.log(
					'info',
					`Proplem fetching initial data from NDI Controller, at: http:/${this.NDIurl}/:${this.NDIport}/state`
				)
				this.connectionStatus.status = this.instance.STATUS_ERROR
			})
	}

	public destroy = () => {
		if (this.pollTimer) {
			clearInterval(this.pollTimer)
		}
	}

	public timerPollNdiController = (): NodeJS.Timeout => {
		return setInterval(() => {
			axios
				.get(`http://${this.NDIurl}:${this.NDIport}/state`)
				.then((response: any): void => {
					this.NDIState = response.data as INdiState
					this.NDIState.sources.forEach((source: ISource, index: number) => {
						this.instance.setVariable(`source${index + 1}`, source.label)
					})
					this.instance.checkFeedbacks(FeedbackId.sourceButton)
				})
				.catch(() => {
					this.instance.log('info', 'Proplem fetching data from NDI Controller')
					this.instance.status(this.instance.STATUS_ERROR)
				})
		}, this.POLL_SPEED)
	}

	public setMtxConnection = (source: number, target: number): void => {
		axios.post(`http://${this.NDIurl}:${this.NDIport}/setmatrix?source=${source}&target=${target}`).catch(() => {
			this.instance.log('info', 'Problem sending data to NDI Controller')
		})
	}

	public getNdiTarget = (targetIndex: number): ITarget => {
		return this.NDIState.targets[targetIndex] || { label: '', selectedSource: 0 }
	}
}
