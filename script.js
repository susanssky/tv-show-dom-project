const rootElem = document.getElementById('roots');
const episodeSelect = document.querySelector('#episode-select');
const showSelect = document.querySelector('#show-select');
const searchInputEpisode = document.querySelector('.search-input-episode');
const searchInputShow = document.querySelector('.search-input-show');
const displayEpisodesNumEl = document.querySelector('.available-episode-num');
const displayShowNumEl = document.querySelector('.available-show-num');
const episodeNav = document.querySelector('.nav-episode');
const showNav = document.querySelector('.nav-show');
const backToShow = document.querySelector('.back-to-show');

const allShows = getAllShows();

let selectValue = '';
let allEpisodes = [];
let showSearchWord = '';
let episodeSearchWord = '';

const titleFillZero = (season, number) => {
  const FillZero = (num) => num.toString().padStart(2, '0');
  return `S${FillZero(season)}E${FillZero(number)}`;
};

function setup() {
  displayShow();
}
const displayShow = (SearchWord = '') => {
  episodeNav.classList.add('invisible');
  showNav.classList.remove('invisible');
  rootElem.textContent = '';
  rootElem.classList = 'grid show-grid';
  showSelect.length = 1;
  allShows
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .filter((show) => {
      return (
        show.name.toLowerCase().includes(SearchWord) ||
        show.genres.map((genre) => genre.toLowerCase()).includes(SearchWord) ||
        show.summary
          .replaceAll('<p>', '')
          .replaceAll('</p>', '')
          .toLowerCase()
          .includes(SearchWord)
      );
    })
    .forEach(
      ({ id, name, genres, status, runtime, image, summary, rating }) => {
        const showContainer = document.createElement('Div');
        const showTitleName = document.createElement('h1');
        const showTitle = document.createElement('Div');
        const showBody = document.createElement('Div');
        const showBodyImg = document.createElement('img');
        const showBodySummary = document.createElement('Div');
        const showBodyRightBox = document.createElement('Div');
        showContainer.classList = 'card-container';

        showTitleName.textContent = name;
        showTitleName.addEventListener('click', () => {
          rootElem.textContent = '';
          fetchedEpisodeAPI(id);
        });

        showTitle.classList = 'show-title card-title';
        showTitle.append(showTitleName);

        showBodyImg.src = image?.medium ?? '';
        showBodySummary.innerHTML = summary;

        showBody.classList = 'show-body card-body';
        showBody.append(showBodyImg, showBodySummary, showBodyRightBox);
        showBodyRightBox.innerHTML = `
    <p><b>Rated:</b> ${rating.average}</p>
    <p><b>Genres:</b> ${genres.join(' | ')}</p>
    <p><b>Status:</b> ${status}</p>
    <p><b>Runtime:</b> ${runtime}</p>`;
        showBodyRightBox.classList = 'show-box';
        showContainer.append(showTitle, showBody);
        rootElem.append(showContainer);

        showSelect.append(buildSelect(name, id));
      }
    );

  //found "available" show(s)
  displayShowNumEl.textContent = `found ${
    document.querySelectorAll('.card-container').length
  } show(s)`;
};

const buildSelect = (selectText, selectValue) => {
  const createOption = document.createElement('option');
  createOption.textContent = selectText;
  createOption.value = selectValue;
  return createOption;
};

const fetchedEpisodeAPI = async (id) => {
  try {
    const res = await fetch(`https://api.tvmaze.com/shows/${id}/episodes`);
    const data = await res.json();
    allEpisodes = data;
    episodeSelect.length = 1;
    searchInputEpisode.disabled = false;
    displayEpisodes(allEpisodes);
  } catch (err) {
    console.error(err);
  }
};

//level 100+200
const displayEpisodes = (source, SearchWord = '') => {
  showNav.classList.add('invisible');
  episodeNav.classList.remove('invisible');

  rootElem.textContent = '';
  rootElem.classList = 'grid episode-grid';
  source
    .filter((episode) => {
      return (
        episode.name.toLowerCase().includes(SearchWord) ||
        episode.summary
          .replaceAll('<p>', '')
          .replaceAll('</p>', '')
          .toLowerCase()
          .includes(SearchWord)
      );
    })
    .forEach(({ name, season, number, image, summary }) => {
      const { medium: imgMedium } = image ?? { medium: '' };
      let combineSeasonNumber = titleFillZero(season, number);

      const episodeContainer = document.createElement('div');
      episodeContainer.classList = 'card-container';
      const episodeTitle = document.createElement('div');
      episodeTitle.textContent = `${name} - ${combineSeasonNumber}`;
      episodeTitle.classList = 'episode-title card-title';

      episodeSelect.append(
        buildSelect(episodeTitle.textContent, episodeTitle.textContent)
      );

      const episodeBody = document.createElement('div');
      episodeBody.classList = 'episode-body card-body';

      const episodeBodyImg = document.createElement('img');
      const episodeBodyDiv = document.createElement('div');
      episodeBodyDiv.innerHTML = summary;
      episodeBodyImg.src = imgMedium;
      episodeBody.append(episodeBodyImg, episodeBodyDiv);
      episodeContainer.append(episodeTitle, episodeBody);
      rootElem.append(episodeContainer);
    });

  //Displaying "available"/total episode(s)
  displayEpisodesNumEl.textContent = `Displaying ${
    document.querySelectorAll('.card-container').length
  }/${allEpisodes.length} episode(s)`;
};

//level 200 build searchInputEpisode
searchInputEpisode.addEventListener('input', (e) => {
  episodeSearchWord = e.target.value.toLowerCase();
  displayEpisodes(allEpisodes, episodeSearchWord);
  if (searchInputEpisode.value) {
    episodeSelect.disabled = true;
  } else {
    episodeSelect.disabled = false;
  }
});

//level 300 build episodeSelect
episodeSelect.addEventListener('change', (e) => {
  selectValue = e.target.value;
  const selectedOneEpisode = allEpisodes.filter((x) => {
    const { name, season, number } = x;
    return `${name} - ${titleFillZero(season, number)}` === selectValue;
  });
  displayEpisodes(selectedOneEpisode);
  if (episodeSelect.value !== 'none') {
    searchInputEpisode.disabled = true;
  } else {
    displayEpisodes(allEpisodes);
    searchInputEpisode.disabled = false;
  }
});

// level 400 build showSelect
showSelect.addEventListener('change', (e) => {
  if (showSelect.value !== 'none') {
    selectValue = e.target.value;
    fetchedEpisodeAPI(selectValue);
  }
  rootElem.textContent = '';
  displayEpisodesNumEl.textContent = '';
});

//level 500 build searchInputShow
searchInputShow.addEventListener('input', (e) => {
  showSearchWord = e.target.value.toLowerCase();
  displayShow(showSearchWord);
});
//level 500 when you are in episode, click button to back to show
backToShow.addEventListener('click', () => displayShow());
window.onload = setup;
