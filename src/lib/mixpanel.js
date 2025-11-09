import mixpanel from "mixpanel-browser";

// Only initialize if we have a project token
const projectToken = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

if (projectToken) {
  mixpanel.init(projectToken, {
    autocapture: true, // enable autocapture
    // (optional) customize:
    // autocapture: {
    //   pageview: "full-url",
    //   click: true,
    //   dead_click: true,
    //   input: true,
    //   rage_click: true,
    //   scroll: true,
    //   submit: true,
    //   capture_text_content: false,
    // },
  });
}

export default mixpanel;

