import Skeleton from "react-loading-skeleton";

export default function ProductCardSkeleton() {
    return (
        <div className="rounded-lg border border-slate-100 bg-white p-2 shadow-sm">
            {/* Image */ }
            <Skeleton height={ 200 } borderRadius={ 12 } />

            {/* Content */ }
            <div className="mt-3 space-y-2">
                {/* Title */ }
                <Skeleton height={ 16 } />
                <Skeleton height={ 16 } width="65%" />

                {/* Price */ }

                <Skeleton height={ 14 } width={ 50 } />

                {/* Meta */ }
                {/* <div className="flex gap-2">
                    <Skeleton height={ 14 } width={ 60 } />
                    <Skeleton height={ 14 } width={ 40 } />
                </div> */}
            </div>
        </div>
    );
}
