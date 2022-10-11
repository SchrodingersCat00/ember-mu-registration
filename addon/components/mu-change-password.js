import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import fetch from 'fetch';

export default class MuChangePasswordComponent extends Component {
  @tracked oldPassword = '';
  @tracked newPassword = '';
  @tracked newPasswordConfirmation = '';

  @tracked loading = false;
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
        id: 'current',
        attributes: {
          'old-password': this.oldPassword,
          'new-password': this.newPassword,
          'new-password-confirmation': this.newPasswordConfirmation,
        },
      },
    });

    return await fetch(`${this.basePath}/current/changePassword`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
      body,
    });
  }

  @action
  async changePassword(event) {
    event.preventDefault();
    this.loading = true;
    this.errorMsg = '';

    const res = await this.sendReq();

    this.loading = false;

    if (res.ok) {
      this.args.onChangePasswordSucceeded?.();
    } else if (res.status === 404) {
      this.errorMsg = '404: Not found';
      this.args.onChangePasswordFailed?.(this.errorMsg);
    } else if (res.status === 400) {
      const json = await res.json();
      const error = json.errors[0];
      console.error('Password change failed: ' + error.title);
      this.errorMsg = error.title;
      this.args.onChangePasswordFailed?.(error);
    }
  }
}
