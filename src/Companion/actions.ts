import { setMtxConnection } from '../NdiController/ndiControllerClient'
import { CompanionActionEvent, CompanionActions, CompanionAction } from '../../../../instance_skel_types'

export enum ActionId {
	SetCrossPoint = 'set_crosspoint',
}

type CompanionActionWithCallback = CompanionAction & Required<Pick<CompanionAction, 'callback'>>

export function GetActionsList(): CompanionActions {
	const entityOnOff = (opt: CompanionActionEvent['options']): void => {
		const srcNumber = parseInt(opt.srcNumber as string)
		const trgNumber = parseInt(opt.trgNumber as string)
		setMtxConnection(srcNumber, trgNumber)
	}

	const actions: { [id in ActionId]: CompanionActionWithCallback | undefined } = {
		[ActionId.SetCrossPoint]: {
			label: 'Set Cross Point',
			options: [
				{
					type: 'number',
					label: 'Source number',
					id: 'srcNumber',
					min: 1,
					max: 100,
					step: 1,
					required: true,
					default: 1,
				},
				{
					type: 'number',
					label: 'Target number',
					id: 'trgNumber',
					min: 1,
					max: 100,
					step: 1,
					required: true,
					default: 1,
				},
			],
			callback: (evt): void => entityOnOff(evt.options),
		},
	}

	return actions
}
