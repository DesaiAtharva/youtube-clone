const box = document.getElementById("box");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");

const API_KEY = "error in getting apikey";
const BASE_URL = "https://www.googleapis.com/youtube/v3";




async function fetchVideo(searchQuery) {
  const endpoint = `${BASE_URL}/search?key=${API_KEY}&q=${searchQuery}&maxResults=40&part=snippet`;
  try {
    const response = await fetch(endpoint);
    const result = await response.json();
    console.log(result);

    for (let i = 0; i < result.items.length; i++) {
      let currentVideoId = result.items[i].id.videoId;
      let channelId = result.items[0].snippet.channelId;
      const currentVideoStatistics = await getVideoStats(currentVideoId);
      const channelLogo = await getChannelLogo(channelId);
      result.items[i].statistics = currentVideoStatistics;
      result.items[i].channelLogo = channelLogo;
    }
    renderVideo(result.items);
  } catch (error) {
    console.log("Some error occured");
  }
}




searchButton.addEventListener("click", () => {
  const searchValue = searchInput.value;
  fetchVideo(searchValue);
});



async function getVideoStats(videoId) {
  const endpoint = `${BASE_URL}/videos?key=${API_KEY}&part=statistics&id=${videoId}`;
  try {
    const response = await fetch(endpoint);
    const result = await response.json();
    return result.items[0].statistics;
  } catch (error) {
    console.log(`failed to fetch the statistics for ${videoId}`);
  }
}




async function getChannelLogo(channelId) {
  const endpoint = `${BASE_URL}/channels?key=${API_KEY}&part=snippet&id=${channelId}`;

  try {
    const response = await fetch(endpoint);
    const result = await response.json();
    
    return result.items[0].snippet.thumbnails.high.url;
  } catch {
    console.log(`failed to load channel logo for ${channelId}`);
  }
}



function navigateToVideoDetails(videoId) {
  document.cookie = `id=${videoId}; path=/video.html`;
  window.location.href = "video.html";
}

function renderVideo(videosList) {
  box.innerHTML = "";
  videosList.forEach((video) => {
    const videobox = document.createElement("div");
    videobox.className = "video";
    videobox.innerHTML = `
        <img
            src="${video.snippet.thumbnails.high.url}"
            alt="thumbnail"
            class="thumbnail"
        />
        <div class="video-details">
          <div class="channel-logo">
            <img
              src="${video.channelLogo}"
              alt="channel-logo"
            />
          </div>
          <div class="more-details">
            <h6 class="title">${video.snippet.title}</h6>
            <p class="gray-text" id="artist">${video.snippet.channelTitle}</p>
            <p class="gray-text" id="vid-stats">${formatViewCount(
              video.statistics.viewCount
            )} views . ${calcTheTimeGap(video.snippet.publishTime)}</p>
          </div>
        </div>`;
    box.addEventListener("click", () => {
      navigateToVideoDetails(video.id.videoId);
    });
    box.appendChild(videobox);
  });
}



function calcTheTimeGap(publishTime) {
  let publishDate = new Date(publishTime);
  let currentDate = new Date();

  let secondsGap = (currentDate.getTime() - publishDate.getTime()) / 1000;

  const secondsPerHour = 60 * 60;
  const secondsPerDay = 24 * secondsPerHour;
  const secondsPerWeek = 7 * secondsPerDay;
  const secondsPerMonth = 30 * secondsPerDay;
  const secondsPerYear = 365 * secondsPerDay;

  if (secondsGap < secondsPerHour) {
    return `${Math.ceil(secondsGap / 60)} mins ago`;
  }
  if (secondsGap < secondsPerDay) {
    return `${Math.ceil(secondsGap / (60 * 60))} hrs ago`;
  }
  if (secondsGap < secondsPerWeek) {
    return `${Math.ceil(secondsGap / secondsPerWeek)} weeks ago`;
  }
  if (secondsGap < secondsPerMonth) {
    return `${Math.ceil(secondsGap / secondsPerMonth)} months ago`;
  }

  return `${Math.ceil(secondsGap / secondsPerYear)} years ago`;
}



function formatViewCount(viewCount) {
  if (viewCount < 1000) {
    return viewCount.toString();
  } else if (viewCount < 1000000) {
    return (viewCount / 1000).toFixed(1) + "K";
  } else if (viewCount < 1000000000) {
    return (viewCount / 1000000).toFixed(1) + "M";
  } else {
    return (viewCount / 1000000000).toFixed(1) + "B";
  }
}



window.addEventListener("load", fetchVideo(""));

