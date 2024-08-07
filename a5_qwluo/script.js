const { createApp } = Vue;

createApp({
  data() {
    return {
      // artist1: "./img/1.jpg",
      // artist2: "./img/2.jpg",
      searchQuery: "",
      artists: [],
      filteredArtists: [],
      totalFound: 0,
      selectedGenres: ["ALL"],
      genres: ["ALL", "Electronic", "Dance", "Pop"],
      sortOptions: ["Reset to original", "Collection Name", "Price"],
      selectedSort: "Reset to original",
      currentAudio: null,

      // tracksGroupedByCollection: {},
      isTracksModalVisible: false,
    };
  },
  methods: {
    searchArtist() {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
        this.searchQuery
      )}&limit=50`;
      // const url = new URL("https://itunes.apple.com/search");
      // url.search = new URLSearchParams({
      //   term: this.searchQuery,
      //   limit: 50,
      // });

      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          this.totalFound = data.resultCount;

          if (data.results.length > 0) {
            this.artists = data.results.map((artist) => ({
              artistId: artist.artistId,
              artistName: artist.artistName
                ? artist.artistName
                : "No information provided",
              collectionName: artist.collectionName
                ? artist.collectionName
                : "No information provided",
              collectionPrice: artist.collectionPrice
                ? artist.collectionPrice.toFixed(2)
                : "0",
              artworkUrl100: artist.artworkUrl100,
              kind: artist.kind ? artist.kind : "No information provided",
              previewUrl: artist.previewUrl,
              country: artist.country,
              trackId: artist.trackId,
              artistActive: "description",
              primaryGenreName: artist.primaryGenreName
                ? artist.primaryGenreName
                : "No information provided",
              isPlaying: false,
              trackName: artist.trackName,
            }));
          } else {
            this.artists = [];
            alert("No artists found with the keyword: " + this.searchQuery);
          }
          this.selectedSort = "Reset to original";
          this.selectedGenres = ["ALL"];
          this.applyFilters();
        })
        .catch((error) => console.error("Error:", error));
    },
    toggleGenre(genre) {
      if (genre === "ALL") {
        this.selectedGenres = ["ALL"];
      } else {
        const index = this.selectedGenres.indexOf(genre);
        // unselect
        if (index > -1) {
          this.selectedGenres.splice(index, 1);
          if (this.selectedGenres.length === 0) {
            this.selectedGenres = ["ALL"];
          }
        } else {
          // select
          this.selectedGenres = this.selectedGenres.filter((g) => g !== "ALL");
          this.selectedGenres.push(genre);
        }
      }
      this.applyFilters();
    },
    applyFilters() {
      // console.log(this.selectedGenres);
      if (this.selectedGenres.includes("ALL")) {
        this.filteredArtists = this.artists;
      } else {
        // this.filteredArtists = this.artists.filter((artist) =>
        //   this.selectedGenres.some((genre) => artist.primaryGenreName === genre)
        // );
        this.filteredArtists = this.artists.filter((artist) =>
          this.selectedGenres.includes(artist.primaryGenreName)
        );
      }
      this.totalFound = this.filteredArtists.length;
      this.sortResults();
      // console.log(this.filteredArtists);
      // console.log(this.artists);
    },
    isGenreSelected(genre) {
      return this.selectedGenres.includes(genre);
    },
    sortResults() {
      if (this.selectedSort === "Reset to original") {
        this.filteredArtists = [...this.filteredArtists];
      }
      if (this.selectedSort === "Collection Name") {
        this.filteredArtists.sort((a, b) =>
          a.collectionName.localeCompare(b.collectionName)
        );
      } else if (this.selectedSort === "Price") {
        this.filteredArtists.sort(
          (a, b) => a.collectionPrice - b.collectionPrice
        );
      }
    },
    selectSort(option) {
      this.selectedSort = option;
      this.applyFilters();
    },
    togglePlay(artist) {
      if (this.currentAudio && this.currentAudio.src === artist.previewUrl) {
        if (artist.isPlaying) {
          this.currentAudio.pause();
        } else {
          this.currentAudio.play();
        }
        artist.isPlaying = !artist.isPlaying;
      } else {
        // Pause currently playing 
        if (this.currentAudio) {
          this.artists.forEach((a) => {
            a.isPlaying = false;
          });
          this.currentAudio.pause();
        }
        // Start playing the new audio
        this.currentAudio = new Audio(artist.previewUrl);
        this.currentAudio.play();
        artist.isPlaying = true;
        this.currentAudio.onended = () => {
          artist.isPlaying = false;
          this.currentAudio = null;
        };
      }
    },
    showTracksModal() {
      this.isTracksModalVisible = true;
    },
    hideTracksModal() {
      this.isTracksModalVisible = false;
    },
  },
  computed: {
    groupedTracks() {
      const groups = this.filteredArtists.reduce((acc, artist) => {
        const name = artist.collectionName || "No information provided";
        if (!acc[name]) acc[name] = [];
        acc[name].push(artist.trackName);
        return acc;
      }, {});
      return groups;
    },
  },
}).mount("#app");
