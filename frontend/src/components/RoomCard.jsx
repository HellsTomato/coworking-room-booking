import { Link } from 'react-router-dom'

import { equipmentList, roomName } from '../utils/rooms.js'

export function RoomCard({ room }) {
  const equipment = equipmentList(room.equipment)

  return (
    <article className="room-card">
      <header className="room-card__header">
        <h3>{roomName(room)}</h3>
        <span className="room-card__capacity">{room.capacity} чел.</span>
      </header>

      {equipment.length > 0 ? (
        <ul className="chips" aria-label="Оборудование">
          {equipment.map((item) => (
            <li className="chip" key={item}>
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">Оборудование не указано</p>
      )}

      <div className="room-card__actions">
        <Link className="button button--ghost" to={`/rooms/${room.id}`}>
          Подробнее
        </Link>
        <Link className="button" to={`/bookings/new?roomId=${room.id}`}>
          Забронировать
        </Link>
      </div>
    </article>
  )
}
