import { format, formatRelative, formatDistanceToNowStrict } from "date-fns";

// export const isValidDate = (date: any) => {
//   return (
//     date &&
//     Object.prototype.toString.call(date) === "[object Date]" &&
//     !isNaN(date)
//   );
// };

type DateInput = Date | string | number;

const dateInputToDate = (date: DateInput) => new Date(date);

const dateIsValid = (date: Date) => !isNaN(new Date(date).getTime());

export const isValidDate = (date: DateInput) => {
  return date && dateIsValid(new Date(date));
};

const dateFormat = (d: DateInput, formatString: string) => {
  const date = dateInputToDate(d);

  if (dateIsValid(date)) {
    return format(date, formatString);
  }
  return "?";
};

const relativeNow = (d: DateInput) => {
  const date = dateInputToDate(d);

  if (dateIsValid(date)) {
    return formatRelative(date, new Date());
  }
  return "?";
};

const formatDistance = (d: DateInput) => {
  const date = dateInputToDate(d);

  if (dateIsValid(date)) {
    return formatDistanceToNowStrict(date, {
      addSuffix: true,
    });
  }
  return "?";
};

export const dateUtils = {
  dateInputToDate,
  isValidDate,
  short: (d: DateInput) => dateFormat(d, "PP"),
  shortWithTime: (d: DateInput) => dateFormat(d, "Pp"),
  format: dateFormat,
  relativeNow,
  formatDistance,
};