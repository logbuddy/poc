import React, { Fragment } from 'react';
import { PersonPlusFill, PersonXFill, Truck } from 'react-bootstrap-icons';
import SkinBox from '../SkinBox';

const DayzEventSkinPresentational = ({event}) => {
    if (event.hasOwnProperty('source') && event.hasOwnProperty('payload')) {
        let parsedPayload = null;
        try {
            parsedPayload = JSON.parse(event.payload);
        } catch (e) {
            return <Fragment/>;
        }

        if (typeof(parsedPayload) !== 'object' || Array.isArray(parsedPayload)) {
            return <Fragment/>;
        }

        switch (event.source) {
            case 'PlayerConnect':
                return (
                    <SkinBox type='success'>
                        <div>
                            <PersonPlusFill/>
                            &nbsp;Player&nbsp;
                            <strong>{parsedPayload.objects[0].name}</strong>
                            &nbsp;joined the server.
                        </div>
                    </SkinBox>
                );
                break;
            case 'PlayerKilled':
                if (parsedPayload.action.cause === 'NATURAL') {
                    return (
                        <SkinBox type='warning'>
                            <div>
                                <PersonXFill/>
                                &nbsp;Player&nbsp;
                                <strong>{parsedPayload.objects[0].name}</strong>
                                &nbsp;died of a natural cause.
                            </div>
                        </SkinBox>
                    );
                } else if (parsedPayload.action.cause === 'OTHER') {
                    return (
                        <SkinBox type='danger'>
                            <div>
                                <PersonXFill/>
                                &nbsp;Player&nbsp;
                                <strong>{parsedPayload.objects[0].name}</strong>
                                &nbsp;died as a victim of&nbsp;
                                <strong>{parsedPayload.action.tool}</strong>.
                            </div>
                        </SkinBox>
                    );
                }
                break;
            case 'ActionGetInTransport':
                return (
                    <SkinBox type='info'>
                        <div>
                            <Truck/>
                            &nbsp;Player&nbsp;
                            <strong>{parsedPayload.objects[0].name}</strong>
                            &nbsp;got into {parsedPayload.objects[1].objtype}&nbsp;
                            <strong>{parsedPayload.objects[1].name}</strong>.
                        </div>
                    </SkinBox>
                );
                break;
            default:
                return <Fragment/>;
        }
    }

    return <Fragment/>;
};

export default DayzEventSkinPresentational;