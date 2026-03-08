import { useCallback } from "react";

const KEYS = {
  home: "tour_seen_home",
  seed: "tour_seen_seed",
  receive: "tour_seen_receive",
  send: "tour_seen_send",
  channels: "tour_seen_channels",
  liquidity: "tour_seen_liquidity",
  p2p: "tour_seen_p2p",
  p2pChannel: "tour_seen_p2p_channel",
  p2pReady: "tour_seen_p2p_ready",
};

export default function useTour(tourName) {
  const key = KEYS[tourName];

  const hasSeenTour = useCallback(
    () => localStorage.getItem(key) === "true",
    [key],
  );

  const startTour = useCallback(
    (createTourFn) => {
      localStorage.setItem(key, "true");
      const tour = createTourFn();
      tour.drive();
    },
    [key],
  );

  return { hasSeenTour, startTour };
}
