import React, { Component } from 'react';
import { connect } from 'react-redux';
import { registerAccount } from '../redux/actionCreators';

const mapStateToProps = state => ({
    reduxState: state
});

const mapDispatchToProps = dispatch => ({
    registerAccount: (email, password) => dispatch(registerAccount(email, password))
});

class RegisterContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {email: '', password: ''};
        this.handleChangeEmail = this.handleChangeEmail.bind(this);
        this.handleChangePassword = this.handleChangePassword.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChangeEmail(event) {
        this.setState({ email: event.target.value, password: this.state.password });
    }

    handleChangePassword(event) {
        this.setState({ password: event.target.value, email: this.state.email });
    }

    handleSubmit(event) {
        this.props.registerAccount(this.state.email, this.state.password);
        event.preventDefault();
    }

    render() {
        return (
            <div className='m-4'>
                <form onSubmit={this.handleSubmit}>
                    <div className="mb-3">
                        <label className='form-label' htmlFor='name'>
                            E-Mail:
                        </label>
                        <input className='form-control' type='text' name='name' value={this.state.email} onChange={this.handleChangeEmail} />
                    </div>
                    <div className="mb-3">
                        <label className='form-label' htmlFor='password'>
                            Password:
                        </label>
                        <input className='form-control' type='password' name='password' value={this.state.password} onChange={this.handleChangePassword} />
                    </div>
                    <div className="mb-3">
                        <button className='btn btn-primary' type='submit'>Register</button>
                    </div>
                </form>
                <hr/>
                <pre>{JSON.stringify(this.props, null, 2)}</pre>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(RegisterContainer);
