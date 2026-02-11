import { applyDecorators, SetMetadata, UseInterceptors } from "@nestjs/common";
import { EPISODE_RENDERER_KEY, EpisodeRendererInterceptor, RenderEpisodeDecoratorProps } from "./renderer.interceptor";

export const RenderEpisode = (props?: RenderEpisodeDecoratorProps) => {
  return applyDecorators(
    SetMetadata(EPISODE_RENDERER_KEY, props),
    UseInterceptors(EpisodeRendererInterceptor),
  );
};
