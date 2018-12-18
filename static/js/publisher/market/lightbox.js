import iframeSize from "../../libs/iframeSize";

function openLightbox(url, images) {
  const lightboxEl = initLightboxEl(images);

  openLightboxEl(lightboxEl, url, images);
}

const lightboxTpl = `
  <div class="vbox-preloader">Loading...</div>
  <div class="vbox-container">
    <div class="vbox-content">
    </div>
  </div>

  <div class="vbox-title" style="display: none;"></div>
  <div class="vbox-num" style="display: none;">0/0</div>
  <div class="vbox-close">X</div>
  <button class="vbox-next">next</button>
  <button class="vbox-prev">prev</button>
`;

const initLightboxEl = () => {
  const lightboxEl = document.createElement("div");
  lightboxEl.className = "vbox-overlay";
  lightboxEl.style.display = "none";
  lightboxEl.style.display = "0";
  lightboxEl.innerHTML = lightboxTpl;

  const closeLightbox = event => {
    event.preventDefault();
    closeLightboxEl(lightboxEl);
  };

  lightboxEl
    .querySelector(".vbox-close")
    .addEventListener("click", closeLightbox);
  lightboxEl.addEventListener("click", event => {
    const ignore = ["figlio", "vbox-next", "vbox-prev"];
    // This assumes a single class on each item
    if (ignore.indexOf(event.target.className) < 0) {
      closeLightbox(event);
    }
  });

  return lightboxEl;
};

const loadLightboxImage = (lightboxEl, url, images) => {
  const contentEl = lightboxEl.querySelector(".vbox-content");
  // hide content before it loads
  contentEl.style.opacity = "0";
  const currentMedia = contentEl.querySelector(".figlio");
  if (currentMedia) {
    contentEl.removeChild(currentMedia);
  }

  if (url === "video") {
    const windowWidth = window.innerWidth;
    const video = document
      .querySelector(".js-video-slide iframe")
      .cloneNode(true);

    let src = video.src;
    if (src) {
      if (src.indexOf("mute=1")) {
        src = src.split("mute=1").join("mute=0");
      }
      if (src.indexOf("autoplay=1")) {
        src = src.split("autoplay=1").join("autoplay=0");
      }

      video.src = src;
    }
    const ratio = video.width / video.height;
    video.width = windowWidth - 64;
    video.height = video.width / ratio;
    video.id = "lightbox-player";
    video.classList.add("figlio");
    contentEl.appendChild(video);
    contentEl.style.opacity = "1";

    // We need to resize the iframe on window resize
    iframeSize(".vbox-content", 1200);
  } else {
    let media;

    // load media
    if (url.includes(".gif")) {
      media = document.createElement("video");
      media.autoplay = true;
      media.loop = true;
      media.classList.add("figlio");
      contentEl.appendChild(media);
      contentEl.style.opacity = "1";

      const originalEl = document.body.querySelector(
        `[data-original="${url}"]`
      );

      if (media.canPlayType("video/webm")) {
        media.src = originalEl.querySelector("[type='video/webm']").src;
      } else if (media.canPlayType("video/mp4")) {
        media.src = originalEl.querySelector("[type='video/mp4']").src;
      }
    } else {
      media = new Image();
      media.classList.add("figlio");
      contentEl.appendChild(media);

      media.addEventListener("load", () => {
        contentEl.style.opacity = "1";
      });
      media.src = url;
    }
  }

  // update prev/next buttons
  if (images && images.length) {
    const imageIndex = images.indexOf(url);

    if (imageIndex > 0) {
      lightboxEl.querySelector(".vbox-prev").removeAttribute("disabled");
      lightboxEl.querySelector(".vbox-prev").dataset.url =
        images[imageIndex - 1];
    } else {
      lightboxEl
        .querySelector(".vbox-prev")
        .setAttribute("disabled", "disabled");
      lightboxEl.querySelector(".vbox-prev").dataset.url = null;
    }

    if (imageIndex < images.length - 1) {
      lightboxEl.querySelector(".vbox-next").removeAttribute("disabled");
      lightboxEl.querySelector(".vbox-next").dataset.url =
        images[imageIndex + 1];
    } else {
      lightboxEl
        .querySelector(".vbox-next")
        .setAttribute("disabled", "disabled");
      lightboxEl.querySelector(".vbox-next").dataset.url = null;
    }
  }
};

const openLightboxEl = (lightboxEl, url, images) => {
  // prepare navigating to next/prev images
  if (images && images.length) {
    const handleNextPrevClick = event => {
      event.preventDefault();
      if (event.target.dataset.url) {
        loadLightboxImage(lightboxEl, event.target.dataset.url, images);
      }
    };

    const handleNextPrevKey = event => {
      const KEYS = {
        ESC: 27,
        LEFT: 37,
        RIGHT: 39
      };
      let image;
      switch (event.keyCode) {
        case KEYS.ESC:
          closeLightboxEl(lightboxEl);
          break;
        case KEYS.LEFT:
          image = lightboxEl.querySelector(".vbox-prev").dataset.url;
          if (image !== "null") {
            loadLightboxImage(lightboxEl, image, images);
          }
          break;
        case KEYS.RIGHT:
          image = lightboxEl.querySelector(".vbox-next").dataset.url;
          if (image !== "null") {
            loadLightboxImage(lightboxEl, image, images);
          }
          break;
      }
    };

    lightboxEl
      .querySelector(".vbox-next")
      .addEventListener("click", handleNextPrevClick);
    lightboxEl
      .querySelector(".vbox-prev")
      .addEventListener("click", handleNextPrevClick);
    window.addEventListener("keyup", handleNextPrevKey);
  }

  // open lightbox
  document.body.classList.add("vbox-open");
  document.body.appendChild(lightboxEl);
  lightboxEl.style.opacity = "1";
  lightboxEl.style.display = "block";

  // load image
  loadLightboxImage(lightboxEl, url, images);
};

const closeLightboxEl = lightboxEl => {
  lightboxEl.style.opacity = "0";
  lightboxEl.style.display = "none";
  if (lightboxEl.parentNode) {
    lightboxEl.parentNode.removeChild(lightboxEl);
  }
  document.body.classList.remove("vbox-open");
};

const lightbox = {
  openLightbox
};

export default lightbox;
