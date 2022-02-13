import { SomeCompanionConfigField } from '../../../../instance_skel_types'

export interface DeviceConfig {
	url: string
	port: number
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'textinput',
			id: 'url',
			label: 'NDI Controller IP',
			width: 6,
			default: '127.0.0.1',
		},
		{
			type: 'number',
			id: 'port',
			label: 'Port',
			min: 1,
			max: 65535,
			default: 5901,
			required: true,
			width: 4,
		},
	]
}
