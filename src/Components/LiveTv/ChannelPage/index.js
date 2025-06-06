import React from 'react'
import './index.css'
import FocusableButton from '../../Common/FocusableButton'
import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation'
import { convertUTCDateToLocalDate, getTodayMidnightDate, timeformat } from '../../../Utils'

 const scheduledPrograms = [
            {
                "id": 28,
                "programmeId": 34,
                "tvId": 1,
                "tvName": "YRF Music",
                "name": null,
                "programmeName": "FRESH ARRIVALS",
                "url": "https://images.kableone.com/Images/TVImages/TVProgram/FreshArrivals_0b2d.jpg",
                "tokenId": null,
                "fromDate": "2025-06-06T12:30:00",
                "toDate": "2025-06-06T13:29:00",
                "title": "FRESH ARRIVALS"
            },
            {
                "id": 29,
                "programmeId": 36,
                "tvId": 1,
                "tvName": "YRF Music",
                "name": null,
                "programmeName": "POP CHARTBUSTERS",
                "url": "https://images.kableone.com/Images/TVImages/TVProgram/PopChartbusters_c529.jpg",
                "tokenId": null,
                "fromDate": "2025-06-06T13:30:00",
                "toDate": "2025-06-06T14:29:00",
                "title": "POP CHARTBUSTERS"
            },
            {
                "id": 36,
                "programmeId": 33,
                "tvId": 1,
                "tvName": "YRF Music",
                "name": null,
                "programmeName": "FILMY HITS",
                "url": "https://images.kableone.com/Images/TVImages/TVProgram/FilmyHits_34df.jpg",
                "tokenId": null,
                "fromDate": "2025-06-07T11:30:00",
                "toDate": "2025-06-07T12:29:00",
                "title": "FILMY HITS"
            },
            {
                "id": 37,
                "programmeId": 34,
                "tvId": 1,
                "tvName": "YRF Music",
                "name": null,
                "programmeName": "FRESH ARRIVALS",
                "url": "https://images.kableone.com/Images/TVImages/TVProgram/FreshArrivals_0b2d.jpg",
                "tokenId": null,
                "fromDate": "2025-06-07T12:30:00",
                "toDate": "2025-06-07T13:29:00",
                "title": "FRESH ARRIVALS"
            },
            {
                "id": 38,
                "programmeId": 36,
                "tvId": 1,
                "tvName": "YRF Music",
                "name": null,
                "programmeName": "POP CHARTBUSTERS",
                "url": "https://images.kableone.com/Images/TVImages/TVProgram/PopChartbusters_c529.jpg",
                "tokenId": null,
                "fromDate": "2025-06-07T13:30:00",
                "toDate": "2025-06-07T14:29:00",
                "title": "POP CHARTBUSTERS"
            }
        ]

function LiveTvChannelPage({focusKey}) {
    const {ref,focusKey: currentFocusKey} = useFocusable({focusKey});

   const midnightDate = getTodayMidnightDate(); // today 00:00
const currentDate = new Date();              // current time
const nextDay = new Date(midnightDate);
nextDay.setDate(midnightDate.getDate() + 1); // tomorrow 00:00

const todayItems = [];
const nextDayItems = [];

scheduledPrograms.forEach(item => {
  const fromDate = convertUTCDateToLocalDate(item.fromDate);
  const toDate = convertUTCDateToLocalDate(item.toDate);

  const isNowPlaying = currentDate >= fromDate && currentDate < toDate;
  const isUpcoming = fromDate > currentDate;

  if (isNowPlaying || isUpcoming) {
    item.fromDate = fromDate;
    item.toDate = toDate;
    item.timeSlot = timeformat(fromDate);
    item.isNowPlaying = isNowPlaying;

    if (fromDate < midnightDate) {
      todayItems.push(item);
    } else if (fromDate >= midnightDate && fromDate <= nextDay) {
      nextDayItems.push(item);
    }
  }
});

// Sort by fromDate
todayItems.sort((a, b) => new Date(a.fromDate) - new Date(b.fromDate));
nextDayItems.sort((a, b) => new Date(a.fromDate) - new Date(b.fromDate));

const result = [];

if (todayItems.length > 0) {
  result.push({
    playListId: 1,
    playlistName: "Today",
    playListType: "LiveTvChannel",
    playlistItems: todayItems
  });
}

if (nextDayItems.length > 0) {
  result.push({
    playListId: 2,
    playlistName: "Tomorrow",
    playListType: "LiveTvChannel",
    playlistItems: nextDayItems
  });
}

console.log('result',result);

  return (
    <FocusContext.Provider value={currentFocusKey}>
    <div className='liveTvChannelContainer'>
        <div className='channelTopWrapper'>
            <div className='channelImageWrapper'>
                <img src="https://images.kableone.com/Images/TVImages/TVChannel/02_TV_3284.jpg"></img>
            </div>
            <div className='channelInformationContainer'>
            <div className='playButtonContainer' ref={ref}>
                <FocusableButton
                    text='PLAY NOW'
                    className='playBtnLiveTvChannel'
                />
            </div>
            <div className='channelInformationWrapper'>
                <div className='channelInfoTitle'>
        YRF MUSIC
                </div>
                <div className='channelInfoDescription'>
                    <p>Lorem Ipsum dhohdeo ljhdcoehd lkdheoihdoieh dclkejdpoicjei pjcpioejcioe kejdioejdopie kejdcoiejoie elkjdoejdoe kjdeopjdpej ;ejdpoejdpoje ;ldjepjdpoej deojdepoj</p>
                    </div>
            </div>
            </div>
            <div className='playInfoBand'>

            </div>
        </div>

        <div className='channelScheduleContainer'>
            <div className='scheduleWrapper'></div>
             <div className='scheduleWrapper'></div>
        </div>
    </div>
    </FocusContext.Provider>
  )
}

export default LiveTvChannelPage