export interface ISource {
	label?: string
	dnsName?: string
	url?: string
}
export interface ITarget {
	label?: string
	selectedSource?: number
	hwPanelId?: string
	hwPanelBtnAmount?: number
	sourceFilter?: Array<number>
}
export interface INdiState {
	targets: ITarget[]
	sources: ISource[]
}
export interface IConnection {
	status: 0 | 1 | 2 | null
}
