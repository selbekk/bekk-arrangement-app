import React, { useEffect, useState } from 'react';
import { Menu } from '../Common/Menu/Menu';
import commonStyle from 'src/global/Common.module.scss';
import { EventListElement } from './EventListElement';
import { getViewEventRoute } from 'src/routing';
import { getEvents, deleteEvent } from 'src/api/arrangementSvc';
import { WithId } from 'src/types';
import {
  IEvent,
  IEventContract,
  deserializeEvent,
  parseEvent,
  IEditEvent,
} from 'src/types/event';
import { isOk, isBad, Ok, Result } from 'src/types/validation';

const toParsedEventsMap = (
  events: WithId<IEventContract>[]
): Map<string, Result<IEditEvent, IEvent>> => {
  return new Map(
    events.map<[string, Result<IEditEvent, IEvent>]>(e => {
      const parsedEvent = parseEvent(deserializeEvent(e));
      return [e.id, parsedEvent];
    })
  );
};

const useEvents = () => {
  const [events, setEvents] = useState<
    Map<string, Result<IEditEvent, IEvent>>
  >();

  useEffect(() => {
    const get = async () => {
      const events = await getEvents();
      const eventsMap = toParsedEventsMap(events);
      setEvents(eventsMap);
    };
    get();
  }, []);

  return events;
};

export const ViewEventsContainer = () => {
  const events = useEvents();
  const onDeleteEvent = async (eventId: string) => {
    await deleteEvent(eventId);
  };

  if (!events) {
    return <div>Loading</div>;
  }
  const eventsKeys = Array.from(events.keys());

  return (
    <div className={commonStyle.container}>
      <div className={commonStyle.content}>
        <Menu tab={'overview'} />
        <h1>Events</h1>
        <div>
          {eventsKeys.map(x => {
            const eventFromMap = events.get(x);
            if (eventFromMap !== undefined && isOk(eventFromMap)) {
              return (
                <EventListElement
                  event={eventFromMap.validated}
                  onClickRoute={getViewEventRoute(x)}
                  delEvent={() => onDeleteEvent(x)}
                />
              );
            }
            return <div>Event with id {x} is no gooooood </div>;
          })}
        </div>
      </div>
    </div>
  );
};
