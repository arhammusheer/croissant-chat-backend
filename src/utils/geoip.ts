import geoip from "geoip-lite";

const geoIP = {
  getCoords: (ip: string) => {
    const geo = geoip.lookup(ip);
    if (geo) {
      return {
        lat: geo.ll[0],
        lon: geo.ll[1],
      };
    }
    return {
			lat: 0,
			lon: 0,
		};
  },
};

export default geoIP;
