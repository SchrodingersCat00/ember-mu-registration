import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import fetch from 'fetch';

export default class MuRegisterComponent extends Component {
    @tracked loading = '';
    @tracked name = '';
    @tracked nickname = '';
    @tracked password = '';
    @tracked passwordConfirmation = '';
    @tracked errorMessage = '';

    basePath = '/accounts';  // TODO: make this configurable

    @action
    async register(event) {
        event.preventDefault();  // prevents reloading of the page
        this.errorMessage = '';
        this.loading = true;
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

        const res = await fetch(this.basePath, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/vnd.api+json',
            },
            body,
        });

        if (res.ok) {
            this.args.onRegister();
        } else {
            this.loading = false;
            const json = await res.json();
            const error = json.errors[0].title;
            console.error('Registration failed: ' + error);
            this.errorMessage = error;
        }
    }
}
 