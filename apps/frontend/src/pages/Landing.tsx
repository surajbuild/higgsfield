import { Video } from "@/components/Video";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel";

const Landing = () => {
  return (
    <div className="relative mx-auto px-20">
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent>
          <CarouselItem className="basis-1/2 lg:basis-1/3">
            <Video
              url="https://cdn.higgsfield.ai/card/9a59ea96-b8be-4602-b527-98b25b65d6cb.mp4"
              title={"build a nice video"}
            />
          </CarouselItem>

          <CarouselItem className="basis-1/2 lg:basis-1/3">
            <Video
              title={"build a nice video"}
              url="https://cdn.higgsfield.ai/card/09a449b1-d36b-4f5d-9283-2c9f9a785dd8.mp4"
            />
          </CarouselItem>

          <CarouselItem className="basis-1/2 lg:basis-1/3">
            <Video
              title={"build a nice video"}
              url="https://cdn.higgsfield.ai/card/2c623c35-129a-47eb-8797-7174a6063daa.mp4"
            />
          </CarouselItem>

          <CarouselItem className="basis-1/2 lg:basis-1/3">
            <Video
              title={"build a nice video"}
              url="https://cdn.higgsfield.ai/card/2c623c35-129a-47eb-8797-7174a6063daa.mp4"
            />
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious className="bg-black text-white" />
        <CarouselNext className="bg-black text-white" />
      </Carousel>
    </div>
  );
};

export default Landing;
