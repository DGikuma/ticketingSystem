type LoadingControl = {
  start: () => void;
  stop: () => void;
};

export const loadingRef: LoadingControl = {
  start: () => {},
  stop: () => {},
};

export const setLoadingRef = (ref: LoadingControl) => {
  loadingRef.start = ref.start;
  loadingRef.stop = ref.stop;
};
