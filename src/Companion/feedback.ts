import { NDIState } from '../NdiController/ndiControllerClient'
import { SetRequired } from 'type-fest'
import InstanceSkel = require('../../../../instance_skel')
import {
	CompanionFeedbackEvent,
	CompanionFeedbacks,
	CompanionFeedbackBoolean,
	CompanionBankAdditionalStyleProps,
	CompanionBankRequiredProps,
} from '../../../../instance_skel_types'
import { DeviceConfig } from './config'

export enum FeedbackId {
	sourceButton = 'source_button',
}

type CompanionFeedbackWithCallback = SetRequired<CompanionFeedbackBoolean, 'callback'>

export function GetFeedbacksList(instance: InstanceSkel<DeviceConfig>): CompanionFeedbacks {
	const SELECT_STYLE: Partial<CompanionBankRequiredProps & CompanionBankAdditionalStyleProps> = {
		color: instance.rgb(100, 100, 100),
		bgcolor: instance.rgb(0, 255, 0),
	}

	const buttonState = (feedback: CompanionFeedbackEvent): boolean => {
		//console.log('Feedback buttonState', feedback)
		const trgNumber: number = feedback.options.trgNumber as number
		const selectedsource: number = (NDIState.targets[trgNumber - 1].selectedSource as number) + 1
		if (feedback.options.srcNumber === selectedsource) {
			feedback.options.active = true
		} else {
			feedback.options.active = false
		}
		return feedback.options.active ? true : false
	}

	const feedbacks: { [id in FeedbackId]: CompanionFeedbackWithCallback | undefined } = {
		[FeedbackId.sourceButton]: {
			type: 'boolean',
			label: 'Source status and label',
			description: 'Source Label and status',
			options: [
				{
					type: 'checkbox',
					id: 'active',
					label: 'Source Active',
					default: true,
				},
				{
					type: 'number',
					id: 'srcNumber',
					label: 'Source Number',
					min: 1,
					max: 100,
					default: 1,
				},
				{
					type: 'number',
					id: 'trgNumber',
					label: 'Target Number',
					min: 1,
					max: 100,
					default: 1,
				},
			],
			style: SELECT_STYLE,
			callback: (feedback): boolean => buttonState(feedback),
		},
	}

	return feedbacks
}
