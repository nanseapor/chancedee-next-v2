import { type Subscription, getSubscriberByEmail } from "@/lib/subscription";
import { userAtom } from "@/store/atom-store";
import { useAtomValue } from "jotai";
import { useCallback, useEffect, useState } from "react";

const useSubscription = () => {
  const user = useAtomValue(userAtom);
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription[]>();
  const checkUserSubscription = useCallback(async () => {
    if (user?.email) {
      setIsLoading(true);
      try {
        const result = await getSubscriberByEmail(user.email);
        setSubscription(result);
      } catch (error) {
        console.error("Error initializing bookmarked blogs:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user) {
      checkUserSubscription();
    }
  }, [user]);

  return { subscription, isLoading };
};
export default useSubscription;
