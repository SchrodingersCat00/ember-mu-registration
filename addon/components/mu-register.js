import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import fetch from 'fetch';

export default class MuRegisterComponent extends Component {
  @tracked loading = false;
  @tracked name = '';
  @tracked nickname = '';
  @tracked password = '';
  @tracked passwordConfirmation = '';
  @tracked errorMsg = '';

  get showFeedbackMsg() {
    return this.args.showFeedbackMsg === null ||
      this.args.showFeedbackMsg === undefined
      ? true
      : this.args.showFeedbackMsg;
  }

  basePath = this.args.basePath ?? '/accounts';

  async sendReq() {
    const body = JSON.stringify({
      data: {
        type: 'accounts',
        attributes: {
          name: this.name,
          nickname: this.nickname,
          password: this.password,
          'password-confirmation': this.passwordConfirmation,
        },
      },
    });

    return await fetch(this.basePath, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
      body,
    });
  }

  @action
  async register(event) {
    event.preventDefault(); // prevents reloading of the page
    this.args.onRegisterClicked?.();
    this.errorMsg = '';
    this.loading = true;

    const res = await this.sendReq();

    this.loading = false;

    if (res.ok) {
      this.args.onRegisterSucceeded?.();
    } else {
      this.password = '';
      this.passwordConfirmation = '';
      if (res.status === 404) {
        this.errorMsg = '404: Not found';
        this.args.onRegisterFailed?.(this.errorMsg);
      } else if (res.status === 400) {
        const json = await res.json();
        const error = json.errors[0];
        this.errorMsg = error.title;
        this.args.onRegisterFailed?.(error);
      }
    }
  }
}
