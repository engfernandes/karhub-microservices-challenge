import { ApiProperty } from '@nestjs/swagger';
import { SpotifyPlaylist } from 'apps/beer-machine/src/modules';

export class BeerPairingEntity {
  @ApiProperty({
    description: 'The ideal beer style for the given temperature.',
    type: 'string',
    example: 'India Pale Ale',
    required: true,
    nullable: false,
  })
  beerStyle: string;

  @ApiProperty({
    description: 'The Spotify playlist associated with the beer style.',
    required: false,
    nullable: true,
    example: {
      name: 'Chill Vibes',
      url: 'https://open.spotify.com/playlist/1234567890abcdef',
      imageUrl:
        'https://i.scdn.co/image/ab67616d0000b2731234567890abcdef12345678',
      owner: 'Spotify',
      tracks: {
        href: 'https://api.spotify.com/v1/playlists/1234567890abcdef/tracks',
        total: 50,
      },
    },
  })
  playlist: SpotifyPlaylist | null;

  constructor(beerPairing: {
    beerStyle: string;
    playlist: SpotifyPlaylist | null;
  }) {
    this.beerStyle = beerPairing.beerStyle;
    this.playlist = beerPairing.playlist;
  }
}
