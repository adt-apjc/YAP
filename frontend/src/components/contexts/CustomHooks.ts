import { useEffect, useState, useRef } from "react";

export const useDidUpdateEffect = (fn: () => any, dependencies: any[]) => {
   const didMountRef = useRef(false);

   useEffect(() => {
      if (didMountRef.current) {
         return fn();
      }
      didMountRef.current = true;
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [...dependencies]);
};

export const useIntersection = (element: React.RefObject<HTMLElement>, rootMargin: string) => {
   const [isVisible, setState] = useState(false);

   useEffect(() => {
      const observer = new IntersectionObserver(
         ([entry]) => {
            setState(entry.isIntersecting);
         },
         { rootMargin },
      );

      element.current && observer.observe(element.current); // start observing

      return () => observer.disconnect();
   }, []);

   return isVisible;
};
