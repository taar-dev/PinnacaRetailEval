# a.py
import wave

def split_stereo_to_mono(input_file="usama.wav", agent_file="agent.wav", customer_file="customer.wav"):
    with wave.open(input_file, 'rb') as stereo:
        params = stereo.getparams()
        n_channels, sampwidth, framerate, n_frames, _, _ = params

        if n_channels != 2:
            raise ValueError("Audio is not stereo")

        frames = stereo.readframes(n_frames)

    left = bytearray()
    right = bytearray()
    for i in range(0, len(frames), sampwidth * 2):
        left.extend(frames[i:i + sampwidth])
        right.extend(frames[i + sampwidth:i + (sampwidth * 2)])

    with wave.open(agent_file, 'wb') as out:
        out.setnchannels(1)
        out.setsampwidth(sampwidth)
        out.setframerate(framerate)
        out.writeframes(bytes(left))

    with wave.open(customer_file, 'wb') as out:
        out.setnchannels(1)
        out.setsampwidth(sampwidth)
        out.setframerate(framerate)
        out.writeframes(bytes(right))

    return agent_file, customer_file