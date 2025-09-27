export const setFavicon = (url) => {
  let link =
    document.querySelector("link[rel~='icon']") ||
    document.createElement("link");
  link.rel = "icon";
  link.href = url;
  document.head.appendChild(link);
};
