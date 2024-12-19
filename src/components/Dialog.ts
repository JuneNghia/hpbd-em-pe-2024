import { isTouchDevice, sleep, toggleVisibility } from '@src/utils';

export interface ILevelDialog {
	question: string;
	answers: string[];
	type?: string;
	hint?: string;
}

const DIALOGS: ILevelDialog[] = [
	{
		question: 'De nhan duoc mon qua cua anh pe phai tra loi dung toan bo cau hoi nhe. Dau tien, ten cua em pe?',
		answers: ['nhi', 'pevk', 'lelannhi'],
		hint: "Chi nhap duoc ten cua em pe thui"
	},
	{
		question:
			'Ten cua nguoi ck ma moi co gai deu ao uoc?<br>' +
			'<span class="dialog-hint">(nguoi vua tang cho pe con camera sony nek)</span>',
		answers: [
			'ckmap',
			'junenghia',
			'trungnghia',
			'nghia',
			'map'
		],
		hint: 'Pe kho, nhin xuong duoi la thay ten ck'
	},
	{
		question:
			'Ngay minh chinh thuc yeu nhau, vi du: 19122024',
		answers: [
			'20122021'
		],
		hint: 'Chan chua',
		type: 'number'
	},
	{
		question:
			'So dien thoai cua ck' + '<span class="dialog-hint">(em pe hay quen sdt anh lam)</span>',
		answers: [
			'0934945803'
		],
		hint: '09*****03',
		type: 'number'
	},
	{
		question:
			'Thanh pho ma tui minh se di hen ho khi vk tu Han Quoc ve' +
			'<span class="dialog-hint">(thanh pho lanh teo ch*m)</span>',
		answers: [
			'dalat'
		],
	},
	{
		question:
			'Pe co dong y ben anh suot cuoc doi nay khong' +
			'<span class="dialog-hint">(nhap CO hoac KHONG)</span>',
		answers: [
			'co'
		],
		hint: "Ah duoc, dam nhap KHONG, gruuu >_<"
	},
	{
		question: 'Yeah, pe da hoan thanh het cac cau hoi. Em pe muon nhan bao nhieu mon qua? Nhap so luong nek vk',
		answers: [],
		type: 'number'
	}
];

export class Dialog {
	private opened: boolean = false;
	private container: HTMLElement;
	private text: HTMLElement;
	private hint: HTMLElement;
	private input: HTMLInputElement;
	private button: HTMLButtonElement;
	private currentDialog: ILevelDialog;

	private shakeTimeout: number;
	private hintTimeout: number;

	constructor() {
		this.container = document.querySelector('#dialog') as HTMLElement;
		this.text = document.querySelector('#dialog-text') as HTMLElement;
		this.hint = document.querySelector('#dialog-hint') as HTMLElement;
		this.input = document.querySelector('#dialog-input') as HTMLInputElement;
		this.button = document.querySelector('#dialog-button') as HTMLButtonElement;
	}

	public async openDialog(index: number): Promise<number | string | void> {
		if (!DIALOGS[index]) return;
		this.setupDialog(DIALOGS[index]);

		await this.toggle(true);
		this.setupInput();
		if (!isTouchDevice) this.input.focus();
		this.input.scrollIntoView();
		const answer = await this.waitForAnswer();
		if (isTouchDevice) {
			this.input.blur();
			await sleep(500);
		}
		this.toggle(false);
		return answer;
	}

	public get isOpened(): boolean {
		return this.opened;
	}

	private setupDialog(dialog: ILevelDialog) {
		this.currentDialog = dialog;
		this.text.innerHTML = dialog.question;
		this.hint.innerHTML = dialog.hint || '';
		this.input.value = '';
	}

	private setupInput() {
		const { type } = this.currentDialog;
		if (type === 'number') {
			this.input.type = type;
			this.input.min = '1';
			this.input.max = '100';
			this.input.step = '1';
			this.input.maxLength = 3;
		} else {
			this.input.maxLength = 16;
			this.input.type = 'text';
		}
	}

	private async toggle(visible: boolean) {
		this.opened = visible;
		await toggleVisibility(this.container, visible);
	}

	private async waitForAnswer(): Promise<number | string> {
		return new Promise(resolve => {
			const handleInputKeypress = (e: KeyboardEvent) => {
				if (e.key.toLowerCase() !== 'enter') return;
				handleAnswer();
			};

			const handleAnswer = () => {
				const inputAnswer = this.getAnswer();
				if (this.answerIsCorrect(inputAnswer)) {
					this.button.removeEventListener('click', handleAnswer);
					this.input.removeEventListener('keypress', handleInputKeypress);
					this.clearShakeButton();
					this.hideHint();
					resolve(inputAnswer);
				} else {
					this.warnWrongAnswer();
				}
			};

			this.button.addEventListener('click', handleAnswer);
			this.input.addEventListener('keypress', handleInputKeypress);
		});
	}

	private getAnswer(): string | number {
		return this.currentDialog.type === 'number'
			? Math.min(Math.round(+this.input.value || 1), 100)
			: this.input.value.trim().toLowerCase();
	}

	private answerIsCorrect(
		inputAnswer: string | number = this.getAnswer()
	): boolean {
		return (
			this.currentDialog.type === 'number' ||
			this.currentDialog.answers.find(a => a === inputAnswer) != null
		);
	}

	private warnWrongAnswer() {
		this.shakeButton();
		this.showHint();
	}

	private shakeButton() {
		if (this.shakeTimeout) return;
		this.button.classList.add('shake');
		this.shakeTimeout = window.setTimeout(() => this.clearShakeButton(), 500);
	}

	private clearShakeButton() {
		if (!this.shakeTimeout) return;
		window.clearTimeout(this.shakeTimeout);
		this.shakeTimeout = 0;
		this.button.classList.remove('shake');
	}

	private showHint() {
		if (!this.hint || this.hintTimeout) return;
		this.hintTimeout = window.setTimeout(() => {
			toggleVisibility(this.hint, true);
			this.hintTimeout = 0;
		}, 1500);
	}

	private hideHint() {
		window.clearTimeout(this.hintTimeout);
		this.hintTimeout = 0;
		toggleVisibility(this.hint, false);
	}
}
