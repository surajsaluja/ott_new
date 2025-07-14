import { useFocusable } from '@noriginmedia/norigin-spatial-navigation'
import { convertUTCDateToLocalDate, getTodayMidnightDate, showModal, timeformat } from '../../../../Utils'
import { useEffect, useState } from 'react';
import { fetchAllLiveTvSchedule } from '../../../../Service/LiveTVService';
import { useHistory, useLocation } from 'react-router-dom';
import useOverrideBackHandler from '../../../../Hooks/useOverrideBackHandler';
import { getTokenisedTvMedia } from '../../../../Utils/MediaDetails';
import { CACHE_KEYS, SCREEN_KEYS, setCache } from '../../../../Utils/DataCache';
import { useBackArrayContext } from '../../../../Context/backArrayContext';

const useLiveTvChannelPage = (focusKey,) => {

  const { ref, focusKey: currentFocusKey, focusSelf } = useFocusable({ focusKey });
  const { setBackArray, backHandlerClicked, currentArrayStack, setBackHandlerClicked, popBackArray } = useBackArrayContext();
  const [scheduledContentData, setScheduledContentData] = useState([]);

  const history = useHistory();
  const location = useLocation();
  const channelData = location.state || {};

  const channelInfo = {
    channelImage: channelData.image,
    channelTitle: channelData.title,
    channelDescription: channelData.description,
    channelId: channelData.id
  };

  const getScheduledPrograms = (scheduledPrograms) => {

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

    const result = [];

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

  useEffect(() => {
    setCache(CACHE_KEYS.CURRENT_SCREEN, SCREEN_KEYS.DETAILS.LIVE_TV_DETAIL_PAGE);
    const loadProgrammesFromServer = async () => {
      const data = {
        "TvId": channelData.id,
        "FromDate": new Date(),
      }
      const response = await fetchAllLiveTvSchedule(data);
      setScheduledContentData(getScheduledPrograms(response.data));
    };

    loadProgrammesFromServer();
  }, []);

  useEffect(() => {
    setBackArray(SCREEN_KEYS.DETAILS.LIVE_TV_DETAIL_PAGE, true);
  }, []);

  useEffect(() => {
    if (backHandlerClicked) {
      const backId = currentArrayStack[currentArrayStack.length - 1];

      if (backId === SCREEN_KEYS.DETAILS.LIVE_TV_DETAIL_PAGE) {
        history.goBack();
        popBackArray();
        setBackHandlerClicked(false);
      }
    }
  }, [backHandlerClicked, currentArrayStack]);

  const onPlayLiveTvEnterPress = async () => {
    try {
      const response = await getTokenisedTvMedia(channelData.channelHandle);
      if (response && response.isSuccess) {
        history.push('/livetvplayer', {
          src: response.data.tvUrl,
          title: channelData.name,
          channelId: channelData.id
        })
      } else {
        showModal('Warning', response.message);
      }
    } catch (error) {
      console.error('error playing Live Tv');
    }

  }


  return {
    scheduledContentData,
    currentFocusKey,
    ref,
    channelInfo,
    onPlayLiveTvEnterPress
  }

}

export default useLiveTvChannelPage;