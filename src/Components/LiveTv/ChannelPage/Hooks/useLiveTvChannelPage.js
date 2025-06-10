import { useFocusable } from '@noriginmedia/norigin-spatial-navigation'
import { convertUTCDateToLocalDate, getTodayMidnightDate, timeformat } from '../../../../Utils'
import { useEffect, useState } from 'react';
import { fetchAllLiveTvSchedule } from '../../../../Service/LiveTVService';

const useLiveTvChannelPage = (focusKey, ) =>{

     const { ref, focusKey: currentFocusKey, focusSelf } = useFocusable({ focusKey});

const [scheduledContentData,setScheduledContentData]  = useState([]);

  const getScheduledPrograms  = (scheduledPrograms) =>{

    const midnightDate = getTodayMidnightDate();
  const currentDate = new Date();
  const nextDay = new Date(midnightDate);
  nextDay.setDate(midnightDate.getDate() + 1);

  const todayItems = [];
  const nextDayItems = [];

  scheduledPrograms.forEach(item => {
    const fromDate = convertUTCDateToLocalDate(item.fromDate);
    const toDate = convertUTCDateToLocalDate(item.toDate);

    const isNowPlaying = currentDate >= fromDate && currentDate < toDate;
    const isUpcoming = fromDate > currentDate;

    if (isNowPlaying || isUpcoming) {
      const updatedItem = {
        ...item,
        fromDate,
        toDate,
        timeSlot: timeformat(fromDate),
        isNowPlaying,
        webThumbnail: item.url,
        category: "LiveTvSchedule",
      };

      if (fromDate < midnightDate) {
        todayItems.push(updatedItem);
      } else if (fromDate >= midnightDate && fromDate <= nextDay) {
        nextDayItems.push(updatedItem);
      }
    }
  });

  todayItems.sort((a, b) => new Date(a.fromDate) - new Date(b.fromDate));
  nextDayItems.sort((a, b) => new Date(a.fromDate) - new Date(b.fromDate));

  const result  =[];

  if (todayItems.length > 0) {
    result.push({
      playListId: 1,
      playlistName: "Today",
      playlistItems: todayItems
    });
  }

  if (nextDayItems.length > 0) {
    result.push({
      playListId: 2,
      playlistName: "Tomorrow",
      playlistItems: nextDayItems
    });
  }

  return result;
}

  useEffect(()=>{
    const loadProgrammesFromServer = async() =>{
        const data = {
    "TvId":1,
    "FromDate":new Date(),
}
        const response = await fetchAllLiveTvSchedule(data);
         setScheduledContentData(getScheduledPrograms(response.data));
    };

    loadProgrammesFromServer();
  },[]);

  useEffect(()=>{
    focusSelf();
  },[])


  return {
    scheduledContentData,
    currentFocusKey,
    ref
  }

}

export default useLiveTvChannelPage;