import React, { useEffect, useMemo, useState } from "react";
import { Image, Typography, Button } from "antd";
import {
  LeftOutlined,
  RightOutlined,
  SwapOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

export type ViewerImage = {
  src: string;
  name?: string;
  key?: string | number;
  mime?: string;
  type?: string;
};

type Props = {
  open: boolean;
  images: ViewerImage[];
  start?: number;
  onClose: () => void;
  className?: string; // style scope
};

const ImageViewerModal: React.FC<Props> = ({
  open,
  images,
  start = 0,
  onClose,
  className = "evidence-preview",
}) => {
  const [visible, setVisible] = useState(open);
  const [current, setCurrent] = useState(start);

  const isPdf = (e: ViewerImage) =>
    e?.mime === "application/pdf" ||
    e?.type === "pdf" ||
    /\.pdf$/i.test(e?.name || "") ||
    /\.pdf$/i.test(String(e?.key || ""));

  const imageItems = useMemo(
    () => (images || []).filter((e) => !isPdf(e)),
    [images]
  );

  useEffect(() => setVisible(open), [open]);
  useEffect(() => setCurrent(start), [start, open]);

  useEffect(() => {
    setCurrent((c) =>
      imageItems.length ? Math.min(Math.max(0, c), imageItems.length - 1) : 0
    );
  }, [imageItems.length]);

  const getName = (idx: number) => {
    const given = images[idx]?.name;
    if (given) return given;
    const url = images[idx]?.src ?? "";
    try {
      const path = new URL(url, window.location.origin).pathname;
      return path.split("/").pop() || "";
    } catch {
      return url.split("/").pop() || "";
    }
  };

  // Hidden nodes feed PreviewGroup
  const nodes = useMemo(
    () =>
      imageItems.map((it, i) => (
        <Image
          key={it.key ?? i}
          src={it.src}
          alt={it.name}
          style={{ display: "none" }}
        />
      )),
    [imageItems]
  );

  if (!imageItems.length) return null;

  return (
    <>
      <Image.PreviewGroup
        preview={{
          visible,
          current,
          onVisibleChange: (v) => {
            setVisible(v);
            if (!v) onClose();
          },
          onChange: (i) => setCurrent(i),
          movable: true,
          rootClassName: className,
          toolbarRender: (_, info) => {
            const {
              current,
              total,
              transform: { scale },
              actions: {
                onActive,
                onFlipY,
                onFlipX,
                onRotateLeft,
                onRotateRight,
                onZoomOut,
                onZoomIn,
                onReset,
              },
            } = info as any;

            return (
              <div className="ep-toolbar">
                <Typography.Text className="ep-filename">
                  {getName(current!)}
                </Typography.Text>

                <div className="ep-controls">
                  {/* flip & rotate */}
                  <Button
                    type="text"
                    className="ep-btn"
                    icon={<SwapOutlined rotate={90} />}
                    onClick={onFlipY}
                  />
                  <Button
                    type="text"
                    className="ep-btn"
                    icon={<SwapOutlined />}
                    onClick={onFlipX}
                  />
                  <Button
                    type="text"
                    className="ep-btn"
                    icon={<RotateLeftOutlined />}
                    onClick={onRotateLeft}
                  />
                  <Button
                    type="text"
                    className="ep-btn"
                    icon={<RotateRightOutlined />}
                    onClick={onRotateRight}
                  />

                  {/* zoom & reset */}
                  <Button
                    type="text"
                    className="ep-btn"
                    icon={<ZoomOutOutlined />}
                    onClick={onZoomOut}
                    disabled={scale <= 1}
                  />
                  <Button
                    type="text"
                    className="ep-btn"
                    icon={<ZoomInOutlined />}
                    onClick={onZoomIn}
                  />
                  <Button
                    type="text"
                    className="ep-btn"
                    icon={<ReloadOutlined />}
                    onClick={onReset}
                  />
                </div>
              </div>
            );
          },
        }}
      >
        {nodes}
      </Image.PreviewGroup>

      {/* Styles to match your screenshot (dark mask, bottom footer, round corner arrows) */}
      <style jsx global>{`
        .${className} .ant-image-preview-wrap {
          background: rgba(0, 0, 0, 0.8);
        }
        .${className} .ant-image-preview-close {
          top: 16px;
          right: 20px;
        }
        .${className} .ant-image-preview-operations {
          inset: auto 0 0 0;
          padding: 8px 16px 12px;
          background: rgba(28, 28, 28, 0.85);
        }
        .${className} .ep-toolbar {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          color: #fff;
        }
        .${className} .ep-filename {
          color: #fff;
          font-weight: 600;
        }
        .${className} .ep-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #fff;
        }
        .${className} .ep-btn,
        .${className} .ep-counter {
          color: #fff;
        }
        /* Keep AntD's switchers but place them bottom corners */
        .${className} .ant-image-preview-switch-left,
        .${className} .ant-image-preview-switch-right {
          top: auto;
          bottom: 16px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.35);
          background: "white";
        }
        .${className} .ant-image-preview-switch-left {
          left: 16px;
        }
        .${className} .ant-image-preview-switch-right {
          right: 16px;
        }
        .${className} .ant-image-preview-count {
          display: none !important;
        }
      `}</style>
    </>
  );
};

export default ImageViewerModal;
