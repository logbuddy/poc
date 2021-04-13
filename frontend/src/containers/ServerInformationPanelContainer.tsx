import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { ChevronDown, ChevronRight, Clipboard } from 'react-bootstrap-icons';
import { switchInformationPanelCommand} from '../redux/reducers/activeServer';
import { ConnectedComponentProps } from '../redux/store';


interface ReactState {
    showCopySuccessBadgeForId: null | string
}

class ServerInformationPanelContainer extends Component<ConnectedComponentProps, ReactState> {

    copyElements: {
        [key: string]: HTMLInputElement
    }

    constructor(props: ConnectedComponentProps) {
        super(props);
        this.state = {
            showCopySuccessBadgeForId: null
        };
        this.copyElements = {};
    }


    copyCodeToClipboard = (id: string) => {
        const el = this.copyElements[id];
        el.select();
        document.execCommand('copy');
        el.blur();
        this.setState({ ...this.state, showCopySuccessBadgeForId: id });
    }

    render() {
        const activeServer = this.props.reduxState.activeServer;
        const server = activeServer.server;

        return (
            <div className='card-body bg-dark pb-0'>
                <div
                    className='clickable'
                    onClick={ () => this.props.dispatch(switchInformationPanelCommand()) }
                >
                    <span className='small align-text-bottom'>
                        {
                            activeServer.informationPanelIsOpen
                            &&
                            <ChevronDown />
                        }
                        {
                            activeServer.informationPanelIsOpen
                            ||
                            <ChevronRight />
                        }
                    </span>
                    &nbsp;
                    Information
                </div>

                {
                    activeServer.informationPanelIsOpen
                    &&
                    <Fragment>
                        <div className='row mt-2 mb-2'>
                            <div className='col-12'>
                                <div className='input-group'>
                                    <div className='input-group-text w-6em border border-dark bg-secondary text-light'>serverId</div>
                                    <input
                                        type='text'
                                        className='form-control text-primary code border border-dark bg-dark'
                                        value={`${server.id}`}
                                        readOnly={true}
                                        disabled={false}
                                        ref={(element: HTMLInputElement) => this.copyElements[server.id + 'id'] = element}
                                    />
                                    {
                                        this.state.showCopySuccessBadgeForId === server.id + 'id'
                                        &&
                                        <div className='input-group-text border border-dark bg-secondary text-white fade-out-half'>
                                            <small>
                                                Copied to clipboard
                                            </small>
                                        </div>
                                    }
                                    <div
                                        className='btn btn-outline-secondary input-group-text text-light'
                                        onClick={() => {
                                            this.copyCodeToClipboard(server.id + 'id');
                                        }}
                                    >
                                        <Clipboard />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='row mt-2 mb-2'>
                            <div className='col-12'>
                                <div className='input-group'>
                                    <div className='input-group-text w-6em border border-dark bg-secondary text-light'>userId</div>
                                    <input
                                        type='text'
                                        className='form-control text-primary code border border-dark bg-dark'
                                        value={`${server.userId}`}
                                        readOnly={true}
                                        disabled={false}
                                        ref={(element: HTMLInputElement) => this.copyElements[server.id + 'userId'] = element}
                                    />
                                    {
                                        this.state.showCopySuccessBadgeForId === server.id + 'userId'
                                        &&
                                        <div className='input-group-text border border-dark bg-secondary text-white fade-out-half'>
                                            <small>
                                                Copied to clipboard
                                            </small>
                                        </div>
                                    }
                                    <div
                                        className='btn btn-outline-secondary input-group-text text-light'
                                        onClick={() => this.copyCodeToClipboard(server.id + 'userId')}
                                    >
                                        <Clipboard />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='row mt-2 mb-2'>
                            <div className='col-12'>
                                <div className='input-group'>
                                    <div className='input-group-text w-6em border border-dark bg-secondary text-light'>apiKeyId</div>
                                    <input
                                        type='text'
                                        className='form-control text-primary code border border-dark bg-dark'
                                        value={`${server.apiKeyId}`}
                                        readOnly={true}
                                        disabled={false}
                                        ref={(element: HTMLInputElement) => this.copyElements[server.id + 'apiKeyId'] = element}
                                    />
                                    {
                                        this.state.showCopySuccessBadgeForId === server.id + 'apiKeyId'
                                        &&
                                        <div className='input-group-text border border-dark bg-secondary text-white fade-out-half'>
                                            <small>
                                                Copied to clipboard
                                            </small>
                                        </div>
                                    }
                                    <div
                                        className='btn btn-outline-secondary input-group-text text-light'
                                        onClick={() => this.copyCodeToClipboard(server.id + 'apiKeyId')}
                                    >
                                        <Clipboard />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Fragment>
                }
                <hr/>
            </div>
        );
    }
}

export default connect(
    reduxState => ({ reduxState }),
    dispatch => ({ dispatch })
    // @ts-ignore
)(ServerInformationPanelContainer);
