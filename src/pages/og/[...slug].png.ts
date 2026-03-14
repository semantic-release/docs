import { type CollectionEntry, getCollection } from "astro:content";
import satori from "satori";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const heroPng = fs.readFileSync(
  path.join(process.cwd(), "src", "assets", "hero.png"),
);
const heroBase64 = `data:image/png;base64,${heroPng.toString("base64")}`;

const logoSvg = fs.readFileSync(
  path.join(process.cwd(), "src", "assets", "sr-logo-dark.svg"),
);
const logoBase64 = `data:image/svg+xml;base64,${logoSvg.toString("base64")}`;

async function loadGoogleFont(
  family: string,
  weight: number,
): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&display=swap`;
  const cssRes = await fetch(url);
  const css = await cssRes.text();
  const match = css.match(/src: url\((.+?)\)/);
  if (!match) throw new Error(`Could not load font ${family}`);
  const fontRes = await fetch(match[1]);
  return fontRes.arrayBuffer();
}

export async function getStaticPaths() {
  const docs = await getCollection("docs");
  return docs.map((doc: CollectionEntry<"docs">) => ({
    params: { slug: doc.id || undefined },
    props: { title: doc.data.title, description: doc.data.description, slug: doc.id || "" },
  }));
}

interface Props {
  title: string;
  description?: string;
  slug: string;
}

export async function GET({ props }: { props: Props }) {
  const { title, description, slug } = props;

  const segments = slug.split("/").filter((s) => s && s !== "index");
  const breadcrumb = ["semantic-release.org", ...segments].join("  /  ");

  const [interBold, interRegular] = await Promise.all([
    loadGoogleFont("Inter", 700),
    loadGoogleFont("Inter", 400),
  ]);

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          display: "flex",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #17181c 0%, #1e1f3b 50%, #17181c 100%)",
          padding: "60px",
          fontFamily: "Inter",
          color: "#ffffff",
          position: "relative",
          overflow: "hidden",
        },
        children: [
          // Subtle gradient overlay
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: 0,
                right: 0,
                width: "600px",
                height: "100%",
                background: "radial-gradient(circle at 80% 50%, rgba(54, 75, 255, 0.15), transparent 70%)",
              },
            },
          },
          // Left content
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                flex: 1,
                zIndex: 1,
                paddingRight: "40px",
              },
              children: [
                // Top: Logo
                {
                  type: "img",
                  props: {
                    src: logoBase64,
                    width: 280,
                    height: 44,
                  },
                },
                // Middle: Title + Description
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    },
                    children: [
                      {
                        type: "div",
                        props: {
                          style: {
                            fontSize: "56px",
                            fontWeight: 700,
                            lineHeight: 1.1,
                            letterSpacing: "-0.03em",
                            color: "#ffffff",
                          },
                          children: title.length > 60 ? title.slice(0, 57) + "..." : title,
                        },
                      },
                      ...(description
                        ? [
                            {
                              type: "div",
                              props: {
                                style: {
                                  fontSize: "22px",
                                  fontWeight: 400,
                                  color: "#c0c2c7",
                                  lineHeight: 1.4,
                                },
                                children:
                                  description.length > 120
                                    ? description.slice(0, 117) + "..."
                                    : description,
                              },
                            },
                          ]
                        : []),
                    ],
                  },
                },
                // Bottom: Breadcrumb path
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      fontSize: "18px",
                      fontWeight: 400,
                      color: "#888b96",
                    },
                    children: breadcrumb,
                  },
                },
              ],
            },
          },
          // Right: Hero image
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1,
              },
              children: {
                type: "img",
                props: {
                  src: heroBase64,
                  width: 412,
                  height: 412,
                  style: {
                    filter: "drop-shadow(0 0 40px rgba(54, 75, 255, 0.3))",
                  },
                },
              },
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Inter", data: interBold, weight: 700, style: "normal" },
        { name: "Inter", data: interRegular, weight: 400, style: "normal" },
      ],
    },
  );

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(png, {
    headers: { "Content-Type": "image/png" },
  });
}
