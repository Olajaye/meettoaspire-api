import { Injectable, Inject, HttpException, HttpStatus, BadGatewayException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as base64 from 'base-64';
import fetch from 'node-fetch';

@Injectable()
export class ZoomService {
  private readonly ZOOM_ACCOUNT_ID: string | undefined;
  private readonly ZOOM_CLIENT_ID: string | undefined;
  private readonly ZOOM_CLIENT_SECRET: string | undefined;

  constructor(private configService: ConfigService) {
    // Load Zoom credentials from environment variables
    this.ZOOM_ACCOUNT_ID = this.configService.get<string>('ZOOM_ACCOUNT_ID') ;
    this.ZOOM_CLIENT_ID = this.configService.get<string>('ZOOM_CLIENT_ID') ;
    this.ZOOM_CLIENT_SECRET = this.configService.get<string>('ZOOM_CLIENT_SECRET');

    // Validate required credentials
    if (!this.ZOOM_ACCOUNT_ID || !this.ZOOM_CLIENT_ID || !this.ZOOM_CLIENT_SECRET) {
      throw new BadGatewayException('Zoom credentials are missing in environment variables.');
    }
  }

  /**
   * Generate Zoom OAuth2 access token.
   * @returns {Promise<string>} Zoom access token.
   */
  async generateZoomAccessToken(): Promise<string> {
    try {
      const authHeaders = this.getAuthHeaders();
      const response = await fetch(
        `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${this.ZOOM_ACCOUNT_ID}`,
        {
          method: 'POST',
          headers: authHeaders,
        },
      );

      if (!response.ok) {
        throw new HttpException('Failed to generate Zoom access token.', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      const jsonResponse = await response.json();
      return jsonResponse.access_token;
    } catch (error) {
      console.error('generateZoomAccessToken Error --> ', error);
      throw new HttpException('Failed to generate Zoom access token.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async generateZoomMeeting(): Promise<any> {
    try {
      const zoomAccessToken = await this.generateZoomAccessToken();
      const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${zoomAccessToken}`,
        },
        body: JSON.stringify({
          agenda: 'Expert meeting with Apirant',
          default_password: false,
          duration: 60,
          password: '12345',
          schedule_for: 'jayeolajeremiah@gmail.com', //aspirant email
          settings: {
            allow_multiple_devices: true,
            breakout_room: {
              enable: true,
              rooms: [
                {
                  name: 'room1',
                  participants: ['email1@gmail.com', 'jayeolajeremiah@gmail.com'],
                },
              ],
            },
            calendar_type: 1,
            auto_recording: 'cloud',
            contact_email: 'jayeolajeremiah@gmail.com',
            contact_name: 'Jayeola Gbolaham',
            email_notification: true,
            encryption_type: 'enhanced_encryption',
            focus_mode: true,
            host_video: true,
            join_before_host: true,
            meeting_authentication: true,
            meeting_invitees: [
              {
                email: 'jayeolajeremiah@gmail.com',
              },
            ],
            mute_upon_entry: true,
            participant_video: true,
            private_meeting: true,
            waiting_room: false,
            watermark: false,
            continuous_meeting_chat: {
              enable: true,
            },
            // join_before_host: true,
          },
          start_time: new Date().toISOString(), // Use ISO format for start_time
          timezone: 'Asia/Kolkata',
          topic: 'Zoom Meeting for YT Demo',
          type: 2, // 1 -> Instant Meeting, 2 -> Scheduled Meeting
        }),
      });
  
      if (!response.ok) {
        throw new HttpException('Failed to generate Zoom meeting.', HttpStatus.INTERNAL_SERVER_ERROR);
      }
  
      const jsonResponse = await response.json();
  
      // Construct the browser-friendly meeting link
      const meetingId = jsonResponse.id;
      const password = jsonResponse.password;
      const browserLink = `https://zoom.us/j/${meetingId}?pwd=${password}`;
  
      // Return the meeting details along with the browser-friendly link
      return {
        ...jsonResponse,
        browserLink,
      };
    } catch (error) {
      console.error('generateZoomMeeting Error --> ', error);
      throw new HttpException('Failed to generate Zoom meeting.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  

  private getAuthHeaders(): object {
    const encodedCredentials = base64.encode(`${this.ZOOM_CLIENT_ID}:${this.ZOOM_CLIENT_SECRET}`);
    return {
      Authorization: `Basic ${encodedCredentials}`,
      'Content-Type': 'application/json',
    };
  }
}