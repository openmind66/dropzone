(function () {
  const form = document.querySelector("#composer-form");
  const messageInput = document.querySelector("#composer-message");
  const feedList = document.querySelector("#feed-list");
  const statsPosts = document.querySelector("#stats-posts");
  const postTemplate = document.querySelector("#post-template");

  const posts = [];
  const imageCache = new WeakMap();

  const composerDropzone = new Dropzone("#composer-dropzone", {
    url: "/upload", // non utilisé, mais requis par Dropzone
    autoProcessQueue: false,
    uploadMultiple: false,
    maxFiles: 1,
    addRemoveLinks: true,
    dictRemoveFile: "Supprimer",
    dictCancelUpload: "Annuler",
    acceptedFiles: "image/*",
  });

  composerDropzone.on("addedfile", (file) => {
    if (composerDropzone.files[1] != null) {
      composerDropzone.removeFile(composerDropzone.files[0]);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      imageCache.set(file, event.target.result);
    };
    reader.readAsDataURL(file);
  });

  composerDropzone.on("removedfile", (file) => {
    imageCache.delete(file);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = messageInput.value.trim();
    if (!message) {
      messageInput.focus();
      return;
    }

    const file = composerDropzone.files[0];
    const image = file ? imageCache.get(file) : null;

    posts.unshift({
      id: crypto.randomUUID(),
      message,
      image,
      createdAt: new Date(),
    });

    renderPosts();

    form.reset();
    composerDropzone.removeAllFiles(true);
    messageInput.focus();
  });

  function renderPosts() {
    feedList.innerHTML = "";
    posts.forEach((post) => {
      const clone = document.importNode(postTemplate.content, true);
      const messageEl = clone.querySelector(".post__message");
      const imageEl = clone.querySelector(".post__image");
      const timeEl = clone.querySelector(".post__time");

      messageEl.textContent = post.message;

      if (post.image) {
        imageEl.src = post.image;
        imageEl.hidden = false;
      } else {
        imageEl.hidden = true;
      }

      timeEl.textContent = formatRelativeTime(post.createdAt);

      feedList.appendChild(clone);
    });

    statsPosts.textContent = posts.length.toString();
  }

  function formatRelativeTime(date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) {
      return "À l'instant";
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `Il y a ${minutes} minute${minutes > 1 ? "s" : ""}`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `Il y a ${hours} heure${hours > 1 ? "s" : ""}`;
    }

    const days = Math.floor(hours / 24);
    return `Il y a ${days} jour${days > 1 ? "s" : ""}`;
  }
})();
