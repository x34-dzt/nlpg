import Elysia, { t } from "elysia";
import { Chat } from "@db/chat/chat";
import { authGuard } from "./auth";
import { ForbiddenError } from "~/lib/error";

export const ownsConversationGuard = new Elysia({
  name: "ownsConversation",
})
  .use(authGuard)
  .guard({
    params: t.Object({
      id: t.String(),
    }),
  })
  .macro("ownsConversation", {
    isAuth: true,
    async resolve({ params, user }) {
      const conversation = await Chat.findConversationById(params.id);
      if (!conversation || conversation.createdBy !== user.id)
        throw new ForbiddenError("Conversation does not belong to you");
      return { conversation };
    },
  });
