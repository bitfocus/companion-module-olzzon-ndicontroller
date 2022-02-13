import { DeviceConfig } from '../Companion/config'
import InstanceSkel = require('../../../../instance_skel')
import axios from 'axios'
import { IConnection, INdiState, ISource } from './interfaces'
import { FeedbackId } from '../Companion/feedback'
import { CompanionVariable } from '../../../../instance_skel_types'

const POLL_SPEED = 300
let NDIurl = ''
let NDIport = 0

export let NDIState: INdiState

export const initializeNdiControllerWatcher = async (instance: InstanceSkel<DeviceConfig>): Promise<IConnection> => {
	const connection: IConnection = { status: instance.STATUS_UNKNOWN }
	NDIurl = instance.config.url || 'localhost'
	NDIport = instance.config.port || 5901

	instance.log('info', `Fetching data from NDI Controller at : http://${NDIurl}:${NDIport}/state`)
	await axios
		.get(`http://${NDIurl}:${NDIport}/state`)
		.then((response): void => {
			const variables: CompanionVariable[] = []
			NDIState = response.data as INdiState
			for (let index = 0; index < NDIState.sources.length; index++) {
				variables.push({ name: `source${index + 1}`, label: 'NDI Controller Source Label' })
			}
			instance.setVariableDefinitions(variables)
			instance.checkFeedbacks()

			connection.timerInstance = timerPollNdiController(instance)
			connection.status = instance.STATUS_OK
		})
		.catch(() => {
			instance.log('info', `Proplem fetching initial data from NDI Controller, at: http:/${NDIurl}/:${NDIport}/state`)
			connection.status = instance.STATUS_ERROR
		})
	return connection
}

const timerPollNdiController = (instance: InstanceSkel<DeviceConfig>): NodeJS.Timeout => {
	return setInterval(() => {
		axios
			.get(`http://${NDIurl}:${NDIport}/state`)
			.then((response: any): void => {
				NDIState = response.data as INdiState
				NDIState.sources.forEach((source: ISource, index: number) => {
					instance.setVariable(`source${index + 1}`, source.label)
				})
				instance.checkFeedbacks(FeedbackId.sourceButton)
			})
			.catch(() => {
				instance.log('info', 'Proplem fetching data from NDI Controller')
				instance.status(instance.STATUS_ERROR)
			})
	}, POLL_SPEED)
}

export const setMtxConnection = (source: number, target: number): void => {
	axios.post(`http://${NDIurl}:${NDIport}/setmatrix?source=${source}&target=${target}`).catch(() => {
		console.log('info', 'Problem sending data to NDI Controller')
	})
}
