import { calendarAPI } from "@/lib/api";
import { CalendarParams } from "@/types/calendar";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

const CALENDAR_QUERY_KEY = "calendar";

export const useCalendarEvents = (params: CalendarParams, enabled = true) => {
  return useQuery({
    queryKey: [CALENDAR_QUERY_KEY, params],
    queryFn: () => calendarAPI.getEvents(params),
    placeholderData: keepPreviousData,
    enabled,
  });
};
