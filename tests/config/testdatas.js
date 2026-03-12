module.exports = {

  bookingPayload1: {
    roomId: 1,
    title: "Test Meeting 1",
    organizerEmail: "test@email.com",
    startTime: "2026-03-12T18:00:00Z",
    endTime: "2026-03-12T19:00:00Z"
  },
  idempotencyKey1: "test-idem-key1",
  bookingPayload2: {
    roomId: 1,
    title: "Test Meeting 2",
    organizerEmail: "test@email.com",
    startTime: "2026-03-12T18:00:00Z",
    endTime: "2026-03-12T19:00:00Z"
  },
  idempotencyKey2: "test-idem-key2",

  overlapBookingPayload: {
    roomId: 1,
    title: "Test overlap Meeting",
    organizerEmail: "test@email.com",
    startTime: "2026-03-12T18:00:00Z",
    endTime: "2026-03-12T19:00:00Z"
  },
 idempotencyoverlapkey:"test-idem-key3",

 cancelpayload1: {
    roomId: 1,
    title: "Test cancel Meeting",
    organizerEmail: "test@email.com",
    startTime: "2026-03-16T08:00:00Z",
    endTime: "2026-03-16T09:00:00Z"
  },
  idempotencycancelKey: "test-idem-key4",

  reportQuery: {
    from: "2026-03-17T00:00:00Z",
    to: "2026-03-21T00:00:00Z"
  }

};