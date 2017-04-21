module.exports = data =>
  data.map(event => ({
    id: event.id,
    name: event.name,
    description: event.description,
    startTime: event.start_time,
    endTime: event.end_time,
    place: {
      id: event.place.id,
      name: event.place.name,
      location: event.place.location
    }
  }))
