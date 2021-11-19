const { getRoudedDate } = require("../../modules/helpers/rounded-time");

test("Should rounded second to date in minute", () => {
  // ARRANGE
  const secondes = 1636133649;

  // ACT
  const date = getRoudedDate(secondes, "minutes");

  // ASSERT
  expect(date.getSeconds()).toBe(0);
  expect(date.getMinutes()).toBe(34);
});

test("Should rounded second to date in hour", () => {
  // ARRANGE
  const secondes = 1636133649;

  // ACT
  const date = getRoudedDate(secondes, "hours");

  // ASSERT
  expect(date.getSeconds()).toBe(0);
  expect(date.getMinutes()).toBe(0);
  expect(date.getHours()).toBe(18);
});

test("Should rounded second to date in day", () => {
  // ARRANGE
  const secondes = 1636133649;

  // ACT
  const date = getRoudedDate(secondes, "days");

  // ASSERT
  expect(date.getSeconds()).toBe(0);
  expect(date.getMinutes()).toBe(0);
  expect(date.getHours()).toBe(0);
  expect(date.getDay()).toBe(5);
});
