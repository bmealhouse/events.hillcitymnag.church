module.exports = data =>
  data.map(event => ({
    id: event.id,
    name: event.name,
    description: event.description,
    startTime: Date.parse(event.start_time),
    endTime: Date.parse(event.end_time),
    place: {
      id: event.place.id,
      name: event.place.name,
      location: event.place.location
    }
  }))
