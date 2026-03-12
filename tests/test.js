const build = require("../src/server");
const db = require("../src/db/dbConnect");
const config = require("./config/testdatas");

let app;

beforeAll(async () => {
  app = await build();
  await app.ready();
});

afterAll(async () => {
  await app.close();
  await db.end();
});

describe("Create Booking API", () => {

  test("should create booking successfully", async () => {

    const response = await app.inject({
      method: "POST",
      url: "/bookings",
      headers: {
        "Idempotency-Key": config.idempotencyKey1
      },
      payload: config.bookingPayload1
    });

    expect(response.statusCode).toBe(201);
  });

  test("should return 409 if booking overlaps", async () => {

    const response = await app.inject({
      method: "POST",
      url: "/bookings",
      headers: {
        "Idempotency-Key": config.idempotencyKey2
      },
      payload: config.bookingPayload2
    });

    expect(response.statusCode).toBe(409);
  });

});


describe("Check idempotency", () => {

  test("same idempotency key should not create duplicate booking", async () => {

    const payload = config.overlapBookingPayload;

    const first = await app.inject({
      method: "POST",
      url: "/bookings",
      headers: {
        "Idempotency-Key": config.idempotencyoverlapkey
      },
      payload
    });

    const second = await app.inject({
      method: "POST",
      url: "/bookings",
      headers: {
        "Idempotency-Key": config.idempotencyoverlapkey
      },
      payload
    });

    const firstBody = JSON.parse(first.body);
    const secondBody = JSON.parse(second.body);
    expect(firstBody.id).toBe(secondBody.id);

  });

});

describe("Check cancellation", () => {

  test("should not allow cancellation within 1 hour", async () => {

    const getBooking = await app.inject({
      method: "GET",
      url: "/bookings"
    });

    const id = JSON.parse(getBooking.body).items[0].id;

    const response = await app.inject({
      method: "POST",
      url: `/bookings/${id}/cancel`
    });

    expect(response.statusCode).toBe(400);

  });

  test("should  allow cancellation if more than 1 hour before meeting start", async () => {

    const payload = config.cancelpayload1;

    const first = await app.inject({
      method: "POST",
      url: "/bookings",
      headers: {
        "Idempotency-Key": config.idempotencycancelKey
      },
      payload
    });

    const id = JSON.parse(first.body).id;

    console.log(JSON.parse(first.body).id)

    const response = await app.inject({
      method: "POST",
      url: `/bookings/${id}/cancel`
    });
    const status = JSON.parse(response.body).status

    expect(response.statusCode).toBe(200);
    expect(status).toBe("cancelled");

  });

  test("cancel already cancelled booking returns same booking", async () => {

  const payload = config.cancelpayload1;

  const create = await app.inject({
    method: "POST",
    url: "/bookings",
    headers: {
      "Idempotency-Key": "cancel-test"
    },
    payload
  });

  const id = JSON.parse(create.body).id;

  await app.inject({
    method: "POST",
    url: `/bookings/${id}/cancel`
  });

  const secondCancel = await app.inject({
    method: "POST",
    url: `/bookings/${id}/cancel`
  });

  expect(secondCancel.statusCode).toBe(200);

});

});

describe("Check utilization report", () => {

  test("should return utilization report", async () => {

    const response = await app.inject({
      method: "GET",
      url: `/reports/room-utilization?from=${config.reportQuery.from}&to=${config.reportQuery.to}`
    });

    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.body);

    expect(Array.isArray(body)).toBe(true);

  });
})