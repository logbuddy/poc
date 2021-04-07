import React, { Fragment } from 'react';
import { endOfToday, format, set, subDays } from 'date-fns';
import TimeRange from 'react-timeline-range-slider';
import { DatetimeHelper } from 'herodot-shared';

const ServerTimelinePresentational = (
    {
        selectedTimelineIntervalStart,
        selectedTimelineIntervalEnd,
        timelineIntervalStart,
        timelineIntervalEnd,
        numbersOfEventsPerHour,
        onUpdateCallback,
        onChangeCallback
    }) => {

    const now = new Date();

    const numberOfEventsPerHourElements = []

    let largestNumber = 0;
    for (let numberOfEventsPerHour of numbersOfEventsPerHour) {
        if (numberOfEventsPerHour > largestNumber) {
            largestNumber = numberOfEventsPerHour;
        }
    }

    let i = 0;
    for (let numberOfEventsPerHour of numbersOfEventsPerHour) {
        numberOfEventsPerHourElements.push(
            <div
                key={i}
                className='bg-secondary d-inline-block align-bottom'
                style={{width: '0.520833333333333%', height: `${22 / largestNumber * numberOfEventsPerHour}px`}}
            />
        );
        i++;
    }

    return (
        <div className='w-100 m-0 sticky-top bg-deepdark border-secondary border-bottom border-1 p-2'>
            <div className='container-fluid'>
                <div className='row tiny text-secondary'>
                    <div className='col align-self-start'>
                        {format(selectedTimelineIntervalStart, 'PPPP')}
                        <br/>
                        {format(selectedTimelineIntervalStart, 'p')}
                    </div>
                    <div className='col align-self-end text-end'>
                        {format(selectedTimelineIntervalEnd, 'PPPP')}
                        <br/>
                        {format(selectedTimelineIntervalEnd, 'p')}
                    </div>
                </div>

            </div>
            <div className='react_time_range__time_range_container number-of-elements-per-hour-container'>
                <div style={{position: 'relative', width: '100%'}}>
                    {numberOfEventsPerHourElements}
                </div>
            </div>
            <TimeRange
                mode={1}
                error={false}
                ticksNumber={DatetimeHelper.timeRangeSelectorConfig.ticksNumber}
                formatTick={(ms) =>
                    `${format(new Date(ms), 'LLL')} ${format(new Date(ms), 'd')}`
                }
                step={60 * 60 * 1000 / 4}
                selectedInterval={[
                    set(
                        subDays(
                            now,
                            DatetimeHelper.timeRangeSelectorConfig.selectedIntervalStartSubDays
                        ),
                        { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }
                    ),
                    endOfToday()
                ]}
                timelineInterval={[
                    timelineIntervalStart,
                    timelineIntervalEnd
                ]}
                onUpdateCallback={ (v) => onUpdateCallback(v.time[0], v.time[1]) }
                onChangeCallback={ () => onChangeCallback() }
            />
        </div>
    )
};

export default ServerTimelinePresentational;
