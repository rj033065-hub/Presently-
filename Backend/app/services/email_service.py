import logging
from typing import Optional

logger = logging.getLogger("presently.email_service")


class EmailProvider:
    """
    Abstract interface for email delivery providers.
    """
    async def send_email(self, to_email: str, subject: str, html_content: str) -> bool:
        raise NotImplementedError("EmailProvider must implement send_email method")


class MockEmailProvider(EmailProvider):
    """
    Development provider that logs email transmission details to output.
    """
    async def send_email(self, to_email: str, subject: str, html_content: str) -> bool:
        logger.info("=========================================")
        logger.info("EMAIL TRANSACTION LOG:")
        logger.info(f"Recipient: {to_email}")
        logger.info(f"Subject: {subject}")
        logger.info("----------------- BODY -----------------")
        logger.info(html_content)
        logger.info("=========================================")
        return True


class EmailService:
    def __init__(self, provider: Optional[EmailProvider] = None):
        self.provider = provider or MockEmailProvider()

    def _get_base_template(self, title: str, preheader: str, body_content: str, cta_text: Optional[str] = None, cta_url: Optional[str] = None) -> str:
        """
        Responsive, beautiful HTML email base wrapper with micro-branding and layout.
        """
        cta_html = ""
        if cta_text and cta_url:
            cta_html = f"""
            <tr>
                <td align="center" style="padding: 20px 0 0 0;">
                    <table border="0" cellspacing="0" cellpadding="0">
                        <tr>
                            <td align="center" style="border-radius: 8px;" bgcolor="#4f46e5">
                                <a href="{cta_url}" target="_blank" style="font-size: 14px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; border-radius: 8px; padding: 12px 24px; border: 1px solid #4f46e5; display: inline-block; font-weight: bold;">{cta_text}</a>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            """

        return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #f4f4f5;
            color: #18181b;
            margin: 0;
            padding: 0;
            -webkit-text-size-adjust: none;
            -ms-text-size-adjust: none;
        }}
        table {{
            border-collapse: collapse;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }}
        img {{
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }}
        @media only screen and (max-width: 600px) {{
            .email-container {{
                width: 100% !important;
                padding: 10px !important;
            }}
            .content-block {{
                padding: 20px !important;
            }}
        }}
    </style>
</head>
<body style="background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0;">
    <span style="display:none !important; visibility:hidden; mso-hide:all; font-size:1px; color:#f4f4f5; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
        {preheader}
    </span>
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <table border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #e4e4e7;">
                    <!-- Header -->
                    <tr>
                        <td align="center" style="background-image: linear-gradient(135deg, #4f46e5 0%, #ec4899 100%); padding: 30px 20px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">Presently</h1>
                                        <p style="color: #e0e7ff; font-size: 13px; margin: 5px 0 0 0; font-weight: 500;">AI-Powered Gifting Concierge</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- Body Content -->
                    <tr>
                        <td class="content-block" style="padding: 40px 30px; background-color: #ffffff;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="color: #18181b; font-size: 15px; line-height: 24px; font-family: Helvetica, Arial, sans-serif;">
                                        {body_content}
                                    </td>
                                </tr>
                                {cta_html}
                            </table>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #fafafa; padding: 24px 30px; border-top: 1px solid #f4f4f5; text-align: center;">
                            <p style="color: #71717a; font-size: 12px; line-height: 18px; margin: 0; font-family: Helvetica, Arial, sans-serif;">
                                You are receiving this because you signed up for reminders on Presently.
                            </p>
                            <p style="color: #a1a1aa; font-size: 11px; margin: 8px 0 0 0; font-family: Helvetica, Arial, sans-serif;">
                                <a href="http://localhost:3000/dashboard/settings/notifications" style="color: #4f46e5; text-decoration: underline;">Notification Settings</a> &bull; <a href="http://localhost:3000/dashboard/settings/notifications?unsubscribe=true" style="color: #a1a1aa; text-decoration: underline;">Unsubscribe</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""

    async def send_welcome_email(self, user_name: str, to_email: str) -> bool:
        subject = "Welcome to Presently - Gifting Made Simple!"
        title = "Welcome to Presently"
        preheader = "Discover a smarter way to celebrate loved ones with AI-powered gifting."
        body_content = f"""
        <p style="font-size: 18px; font-weight: bold; margin-top: 0;">Hi {user_name},</p>
        <p>We're thrilled to welcome you to <strong>Presently</strong>! Our mission is to take the stress and guesswork out of gift-giving, helping you discover unique, highly personalized presents for the people who matter most.</p>
        <p>Here is what you can do right now to get started:</p>
        <ul>
            <li style="margin-bottom: 10px;"><strong>Set up occasion reminders</strong> in your Gift Planner so you never miss a birthday or anniversary.</li>
            <li style="margin-bottom: 10px;"><strong>Take our 1-minute AI Survey</strong> to find curated suggestions tailored to a recipient's specific personality.</li>
            <li style="margin-bottom: 10px;"><strong>Create a Wishlist</strong> and share it with friends and family.</li>
        </ul>
        <p>If you have any questions, feel free to reply to this email.</p>
        <p>Happy Gifting,<br>The Presently Team</p>
        """
        html = self._get_base_template(title, preheader, body_content, "Go to Dashboard", "http://localhost:3000/dashboard")
        return await self.provider.send_email(to_email, subject, html)

    async def send_occasion_reminder(
        self,
        user_name: str,
        recipient: str,
        occasion: str,
        event_date: str,
        days_remaining: int,
        budget: str,
        to_email: str,
        gift_plan_url: str = "http://localhost:3000/dashboard/planner"
    ) -> bool:
        days_text = "today" if days_remaining == 0 else f"in {days_remaining} days"
        subject = f"Reminder: {recipient}'s {occasion} is {days_text}!"
        title = "Occasion Reminder"
        preheader = f"Your upcoming event '{occasion}' for {recipient} is in {days_remaining} days."
        
        body_content = f"""
        <p style="font-size: 18px; font-weight: bold; margin-top: 0;">Hi {user_name},</p>
        <p>This is a reminder that <strong>{recipient}'s {occasion}</strong> is coming up on <strong>{event_date}</strong> ({days_text} remaining).</p>
        <p><strong>Gifting Occasion Details:</strong></p>
        <table border="0" cellpadding="8" cellspacing="0" width="100%" style="background-color: #fafafa; border-radius: 8px; border: 1px solid #e4e4e7; margin-bottom: 15px;">
            <tr>
                <td width="30%" style="font-weight: bold; color: #71717a;">Recipient:</td>
                <td>{recipient}</td>
            </tr>
            <tr>
                <td style="font-weight: bold; color: #71717a;">Occasion:</td>
                <td>{occasion}</td>
            </tr>
            <tr>
                <td style="font-weight: bold; color: #71717a;">Planned Budget:</td>
                <td>{budget}</td>
            </tr>
        </table>
        <p>Don't wait until the last minute! Use Presently to find the perfect recommendation and plan ahead.</p>
        """
        html = self._get_base_template(title, preheader, body_content, "View Gift Plan", gift_plan_url)
        return await self.provider.send_email(to_email, subject, html)

    async def send_gift_plan_reminder(
        self,
        user_name: str,
        recipient: str,
        occasion: str,
        event_date: str,
        days_remaining: int,
        status: str,
        gift_idea: Optional[str],
        to_email: str,
        gift_plan_url: str = "http://localhost:3000/dashboard/planner"
    ) -> bool:
        subject = f"Action Required: Plan {recipient}'s {occasion} Gift"
        title = "Gift Planner Status Update"
        preheader = f"Plan updates for {recipient}'s {occasion} ({days_remaining} days left)."
        
        status_message = ""
        cta_text = "Select a Gift"
        if status.lower() == "planning":
            status_message = f"You still haven't selected a gift for {recipient}'s {occasion}. Let our AI engine recommend some ideas!"
            cta_text = "Get AI Recommendations"
        elif status.lower() == "gift_selected":
            status_message = f"You selected the gift idea <strong>{gift_idea or 'Curated Pick'}</strong>. Have you purchased it yet?"
            cta_text = "Mark as Purchased"
        elif status.lower() == "purchased":
            status_message = f"Remember to prepare and wrap {recipient}'s gift before {event_date}."
            cta_text = "Mark as Delivered"
        else:
            status_message = f"Check the status of your gift plan for {recipient}."
            cta_text = "View Planner"

        body_content = f"""
        <p style="font-size: 18px; font-weight: bold; margin-top: 0;">Hi {user_name},</p>
        <p>{status_message}</p>
        <p><strong>Occasion:</strong> {occasion}<br>
        <strong>Event Date:</strong> {event_date} ({days_remaining} days left)</p>
        <p>Stay organized and make their day special!</p>
        """
        html = self._get_base_template(title, preheader, body_content, cta_text, gift_plan_url)
        return await self.provider.send_email(to_email, subject, html)

    async def send_recommendation_ready(self, user_name: str, recipient: str, occasion: str, to_email: str) -> bool:
        subject = f"Your AI recommendations for {recipient} are ready!"
        title = "Recommendations Ready"
        preheader = f"We found the perfect gift ideas for {recipient}'s {occasion}."
        body_content = f"""
        <p style="font-size: 18px; font-weight: bold; margin-top: 0;">Hi {user_name},</p>
        <p>Our AI Recommendation Engine has finished searching the catalog for <strong>{recipient}'s {occasion}</strong> based on your preferences.</p>
        <p>We found top personalized gift ideas matching their relationship and style.</p>
        """
        html = self._get_base_template(
            title,
            preheader,
            body_content,
            "View Recommendations",
            "http://localhost:3000/dashboard/recommendations"
        )
        return await self.provider.send_email(to_email, subject, html)

    async def send_wishlist_update(self, user_name: str, wishlist_name: str, update_details: str, to_email: str) -> bool:
        subject = f"Update on your Wishlist: {wishlist_name}"
        title = "Wishlist Update"
        preheader = f"There are price drops or availability changes on your wishlist {wishlist_name}."
        body_content = f"""
        <p style="font-size: 18px; font-weight: bold; margin-top: 0;">Hi {user_name},</p>
        <p>We wanted to let you know that there are changes on your wishlist <strong>{wishlist_name}</strong>:</p>
        <p style="background-color: #fdf2f8; color: #db2777; padding: 15px; border-radius: 8px; border-left: 4px solid #ec4899; font-weight: 500;">
            {update_details}
        </p>
        <p>Check it out before the deal expires!</p>
        """
        html = self._get_base_template(
            title,
            preheader,
            body_content,
            "View Wishlist",
            "http://localhost:3000/wishlist"
        )
        return await self.provider.send_email(to_email, subject, html)

    async def send_community_activity(self, user_name: str, activity_type: str, details: str, to_email: str) -> bool:
        subject = "New activity on your Presently community posts"
        title = "Community Activity"
        preheader = f"Someone interacted with your Presently community activity: {activity_type}."
        body_content = f"""
        <p style="font-size: 18px; font-weight: bold; margin-top: 0;">Hi {user_name},</p>
        <p>You have new social notifications from the Presently Community:</p>
        <p style="background-color: #fafafa; padding: 15px; border-radius: 8px; border: 1px solid #e4e4e7;">
            {details}
        </p>
        <p>Join the conversation and reply to their thoughts!</p>
        """
        html = self._get_base_template(
            title,
            preheader,
            body_content,
            "Open Community Feed",
            "http://localhost:3000/community"
        )
        return await self.provider.send_email(to_email, subject, html)
